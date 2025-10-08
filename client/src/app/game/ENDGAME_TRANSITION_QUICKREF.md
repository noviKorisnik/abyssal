# End Game Transition - Quick Reference

## What It Does
Shows the final board state for 4 seconds with "WINNER: [name]" and timer at 0, then transitions to rankings.

## Key Components

### game.component.ts
```typescript
// When done state received from server:
if (data.phase === 'done' && !this.showingFinalBoard && this.state?.phase === 'active') {
  // 1. Store actual done state
  this.actualDoneState = data;
  
  // 2. Create fake active state with winner info
  const fakeActiveState = { phase: 'active', active: { remainingTurnTime: 0, ... } };
  
  // 3. Show fake active state
  this.state = fakeActiveState;
  this.showingFinalBoard = true;
  
  // 4. Schedule transition after 4 seconds
  setTimeout(() => {
    this.state = this.actualDoneState;
    this.showingFinalBoard = false;
  }, 4000);
}
```

### game-active.component.ts
```typescript
getCurrentPlayerName(): string {
  // When remainingTurnTime === 0, show "WINNER: [name]"
  if (this.state?.active?.remainingTurnTime === 0) {
    return `WINNER: ${playerName}`;
  }
  return playerName;
}
```

### game.component.html
```html
<!-- Keep showing active component during final board display -->
@if (state?.phase === 'active' || showingFinalBoard) {
  <app-game-active ...></app-game-active>
}
```

## Timeline
```
Game Ends
    ↓
Server sends done state
    ↓
Client creates fake active state (remainingTurnTime: 0)
    ↓
Shows "WINNER: [name]" with countdown at 0
    ↓
Displays final board with explosion animation
    ↓
Wait 4 seconds
    ↓
Transition to actual done state (rankings screen)
```

## Adjusting the Delay
In `game.component.ts`, change the timeout value:
```typescript
setTimeout(() => { ... }, 4000); // 4000ms = 4 seconds
```

## Visual Elements During Final Board
- ✅ Timer bar shows winner's color
- ✅ Timer label shows "WINNER: [winner name]"
- ✅ Countdown shows 0
- ✅ Final move has explosion animation
- ✅ All ships, hits, sinks visible
- ✅ Board is not interactive
