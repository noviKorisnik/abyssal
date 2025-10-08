# End Game Transition Feature

## Overview

When a game ends, instead of immediately showing the "Done" screen with rankings, the client displays a "final board state" for 4 seconds showing:
- The complete final board with all moves played
- The winner's name in the timer bar as "WINNER: [name]"
- A countdown timer showing 0
- The winner's color in the timer bar
- The cell explosion animation for the final move

This gives players a moment to see the final state of the game before transitioning to the rankings screen.

## How It Works

### 1. Detection
When the server sends a `phase: 'done'` state message:
- `game.component.ts` detects the transition from `active` to `done`
- Only triggers if `!showingFinalBoard` (prevents retriggering)

### 2. Fake Active State Creation
The component creates a synthetic "active" state:
```typescript
const fakeActiveState = {
  ...data,
  phase: 'active', // Pretend we're still in active phase
  active: {
    ...data.active,
    turnTimer: {
      totalMs: 5000,  // 5 second display duration
      remainingMs: 0   // But show 0 on the timer
    },
    currentPlayerId: winner?.userId // Set winner as current player for color
  }
};
```

### 3. Winner Information Display
- The timer bar shows the winner's color (from their player index)
- The label shows "WINNER: [winner name]"
- The countdown shows 0
- The board shows all final moves including hits, sinks, and eliminations

### 4. Delayed Transition
After 4 seconds:
- `showingFinalBoard` is set to `false`
- The actual `done` state is applied
- The game transitions to the `GameDoneComponent` showing rankings

## Implementation Details

### game.component.ts
```typescript
// Fields
showingFinalBoard: boolean = false;
private finalBoardTimeout: any = null;
private actualDoneState: GameStatusMessage | null = null;

// In handleSocketMessage, case 'state':
if (data.phase === 'done' && !this.showingFinalBoard && this.state?.phase === 'active') {
  // Store actual done state
  this.actualDoneState = data;
  
  // Find winner
  const winner = data.done?.placements?.find((p: any) => p.rank === 1);
  
  // Create fake active state
  const fakeActiveState = { /* ... */ };
  
  // Apply fake state
  this.state = fakeActiveState;
  this.showingFinalBoard = true;
  
  // Schedule transition to real done state
  this.finalBoardTimeout = setTimeout(() => {
    this.showingFinalBoard = false;
    this.state = this.actualDoneState;
    this.actualDoneState = null;
  }, 4000);
  
  return; // Don't continue with normal state processing
}
```

### game-active.component.ts
```typescript
getCurrentPlayerName(): string {
  if (!this.state?.active?.currentPlayerId) return 'Unknown';
  const player = this.state.players?.find(p => p.userId === this.state?.active?.currentPlayerId);
  const playerName = player?.playerName || player?.userId || 'Unknown';
  
  // If timer is at 0, this is the final board showing the winner
  const remainingTime = this.state?.active?.remainingTurnTime || 0;
  if (remainingTime === 0) {
    return `WINNER: ${playerName}`;
  }
  
  return playerName;
}
```

## Template Logic

### game.component.html
```html
@if (state?.phase === 'active' || showingFinalBoard) {
  <app-game-active ...></app-game-active>
}
@else if (state?.phase === 'done') {
  <app-game-done ...></app-game-done>
}
```

The `|| showingFinalBoard` condition keeps the active component visible even when the real state is `done`.

## User Experience

1. **Last Move Animation**: The final cell played triggers the explosion animation (white flash → fade)
2. **Winner Display**: Timer bar shows "WINNER: [name]" with winner's color
3. **Zero Countdown**: Timer shows 0 to indicate game is over
4. **Final Board**: All ships, hits, sinks, and eliminations are visible
5. **4 Second Pause**: Gives players time to review the final state
6. **Automatic Transition**: After 4 seconds, smoothly transitions to rankings screen

## Timing Configuration

The delay is configurable in `game.component.ts`:

```typescript
this.finalBoardTimeout = setTimeout(() => {
  // Transition to done state
}, 4000); // Change this value to adjust delay (in milliseconds)
```

Current: 4000ms (4 seconds)
Recommended range: 3000-5000ms (3-5 seconds)

## Cleanup

The component properly cleans up timers on destroy:

```typescript
ngOnDestroy() {
  // ... other cleanup
  this.clearFinalBoardTimeout();
}

clearFinalBoardTimeout() {
  if (this.finalBoardTimeout) {
    clearTimeout(this.finalBoardTimeout);
    this.finalBoardTimeout = null;
  }
}
```

## Edge Cases

### Multiple Done Messages
The `!showingFinalBoard` check prevents re-triggering if the server sends multiple `done` messages.

### Component Navigation
If the user navigates away during the 4-second display, the timeout is cleaned up properly.

### State Consistency
The actual `done` state is stored in `actualDoneState` and applied after the delay, ensuring no data is lost.

## Benefits

1. **Visual Clarity**: Players can see exactly how the game ended
2. **Celebration**: Winner's name and color are prominently displayed
3. **Final Move Visibility**: The explosion animation highlights the game-ending move
4. **Smooth Transition**: 4-second pause feels natural, not jarring
5. **Context Preservation**: Players can review the final board before seeing rankings
