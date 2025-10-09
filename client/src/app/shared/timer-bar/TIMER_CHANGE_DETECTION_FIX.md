# Timer Change Detection Fix

## Problem

Client countdown timer animation would disappear when server auto-played after timeout:
- Timer would freeze or reset incorrectly
- After client refresh, timer would work for one or two turns, then disappear again
- Root cause: Angular change detection not triggering when `remainingTime` primitive value was similar

## Root Cause Analysis

### The Issue
When a new turn starts, especially after server auto-play:
1. Server broadcasts new state with `remainingTurnTime: 15000` (full time)
2. Client receives state update
3. Component passes `remainingTurnTimeSeconds: 15` to timer component
4. Angular's `ngOnChanges` checks if `remainingTime` input changed
5. **If previous value was also `15`, change detection doesn't trigger**
6. Timer doesn't reset/restart
7. Timer animation breaks

### Why It Happened
- Angular change detection for `@Input()` properties compares by **reference** for objects, but by **value** for primitives
- When passing primitive numbers: `15 === 15` → no change detected
- Even though it's a NEW turn with FRESH countdown, Angular doesn't see it as changed

## Solution

Pass timer state as an **object** instead of primitives:

```typescript
// Before (primitives - change detection fails)
[totalTime]="turnTimeLimitSeconds"
[remainingTime]="remainingTurnTimeSeconds"

// After (object - always triggers change detection)
[timerState]="timerState"
```

### How It Works

**game-active.component.ts**:
```typescript
// Property updated ONLY when state changes (in ngOnChanges)
timerState: { total: number; remaining: number } = { total: 0, remaining: 0 };

ngOnChanges(changes: any) {
  // Create new object only when state input changes
  if (changes['state'] && this.state?.active) {
    this.timerState = {
      total: this.turnTimeLimitSeconds,
      remaining: this.remainingTurnTimeSeconds
    };
  }
}
```

When Angular receives new state from server:
- `ngOnChanges` fires because `state` object reference changed
- New `timerState` object is created: `{ total: 15, remaining: 15 }`
- Even if values are identical, **object reference is different**
- Timer component's `ngOnChanges` detects change: `previousObj !== newObj`
- Timer restarts properly
- **No unnecessary object creation** - only when state actually changes

**timer-bar.component.ts**:
```typescript
@Input() timerState?: { total: number; remaining: number };

ngOnChanges(changes: SimpleChanges) {
  if (changes['timerState'] && this.timerState) {
    const roundedTime = Math.floor(this.timerState.remaining);
    this.totalTimeCached = this.timerState.total;
    this.startCountdown(roundedTime);
  }
}
```

## Changes Made

### 1. game-active.component.ts
- Added `timerState` property (not getter) updated in `ngOnChanges`
- Creates new object ONLY when state changes (efficient)
- Keeps old `turnTimeLimitSeconds` and `remainingTurnTimeSeconds` getters for internal use

### 2. game-active.component.html
- Changed from `[totalTime]` and `[remainingTime]` to `[timerState]`

### 3. game-ready.component.ts
- Added `timerState` property updated in `ngOnChanges`
- Creates new object when countdown state changes

### 4. game-ready.component.html
- Changed from `[totalTime]` and `[remainingTime]` to `[timerState]`

### 5. timer-bar.component.ts
- Added `timerState` input (object-based)
- Removed deprecated `totalTime` and `remainingTime` inputs
- Simplified `ngOnChanges` to only handle timerState
- Added `totalTimeCached` property to store total for progress calculation
- Updated `progressPercentage` to use cached total

## Benefits

✅ **Reliable change detection**: Works every time, regardless of values
✅ **Handles auto-play**: Timer resets correctly when server auto-plays
✅ **Handles rapid turns**: Even rapid fire turns trigger properly
✅ **Clean API**: Single timerState input, no deprecated properties
✅ **Efficient**: Object created only when state changes, not on every access
✅ **Consistent**: Same pattern used in both game-active and game-ready components
✅ **Performance**: Object creation is negligible for this use case

## Performance Note

The solution is efficient because:
- Object created **only when state changes** (in `ngOnChanges`)
- Not created on every getter access or change detection cycle
- Small object (2 properties)
- No observable performance impact
- Much better than timer not working or unnecessary network sync

## Testing

1. Join a game with turn timeout enabled
2. Let timer run to 0 (server auto-plays)
3. Observe timer correctly resets for next turn
4. Let multiple turns auto-play rapidly
5. Confirm timer animation works continuously
6. No need to refresh client

## Alternative Solutions Considered

### ❌ 3-Second Sync Broadcasts
- Server broadcasts every 3 seconds during turn
- Unnecessary network traffic
- Doesn't solve the root cause (still primitives)
- Overkill for client-side issue

### ❌ Change Detection Strategy OnPush
- Would require manual change detection triggering
- More complex code
- Doesn't address input comparison issue

### ❌ Keep Deprecated Primitive Inputs
- Clutters the API
- Maintains backward compatibility for no reason
- Less clear which approach to use

### ✅ Object-Based Input (Chosen)
- Simple, clean solution
- Leverages Angular's change detection as designed
- No server-side changes needed
- Minimal code changes
- Solves the root cause directly
- Clean API with single input approach
