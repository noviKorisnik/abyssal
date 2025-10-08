# Cell Explosion Animation

## Overview

The cell explosion animation provides visual feedback when a cell is played, creating a quick flash-to-white effect followed by a slower fade to the normal played state.

## How It Works

### Animation Sequence

1. **Initial State** (0%): Cell at normal background (`rgba(255, 255, 255, 0.2)`)
2. **Flash** (15% / ~150ms): Quick transition to full white with glow effect
3. **Fade** (15-100% / ~850ms): Slower transition back to normal played state

### Total Duration
- **1000ms (1 second)** total animation time
- **150ms** to reach peak brightness
- **850ms** to fade back to normal

## Implementation

### Detection Logic

Located in `game-active.component.ts`:

```typescript
ngOnChanges(changes: any) {
  // Detect new turn in history
  if (this.state?.history) {
    const currentHistoryLength = this.state.history.length;
    
    if (currentHistoryLength > this.lastHistoryLength) {
      // New turn detected - get the last move
      const lastMove = this.state.history[currentHistoryLength - 1];
      if (lastMove?.cell) {
        const cellKey = `${lastMove.cell.x},${lastMove.cell.y}`;
        this.explodingCells.add(cellKey);
        
        // Remove explosion class after animation completes
        setTimeout(() => {
          this.explodingCells.delete(cellKey);
        }, 1000);
      }
    }
    
    this.lastHistoryLength = currentHistoryLength;
  }
}
```

### CSS Classes

Applied in `getCellClasses()`:

```typescript
getCellClasses(x: number, y: number): string[] {
  const classes = ['cell'];
  
  // Check for explosion animation
  const cellKey = `${x},${y}`;
  if (this.explodingCells.has(cellKey)) {
    classes.push('cell-exploding');
  }
  // ... other classes
}
```

### Animation Styles

Located in `board.component.scss`:

```scss
.cell-exploding {
  animation: cell-explode 1s ease-out forwards;
}

@keyframes cell-explode {
  0% {
    background: rgba(255, 255, 255, 0.2);
  }
  15% {
    background: rgba(255, 255, 255, 1);
    border-color: rgba(255, 255, 255, 1);
    box-shadow: 0 0 20px rgba(255, 255, 255, 0.8),
                0 0 40px rgba(255, 255, 255, 0.4);
  }
  100% {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.25);
    box-shadow: none;
  }
}
```

## Visual Effects

### Flash Phase (0-15%)
- **Background**: Transitions to pure white (`rgba(255, 255, 255, 1)`)
- **Border**: Becomes bright white
- **Glow**: Two-layer box-shadow creates explosion effect
  - Inner glow: `0 0 20px rgba(255, 255, 255, 0.8)`
  - Outer glow: `0 0 40px rgba(255, 255, 255, 0.4)`

### Fade Phase (15-100%)
- **Background**: Gradually returns to normal played state
- **Border**: Fades to normal transparency
- **Glow**: Dissipates completely

## Timing Details

| Phase | Duration | Easing | Effect |
|-------|----------|--------|--------|
| Flash | 150ms | ease-out (fast start) | Quick explosion to white |
| Fade | 850ms | ease-out (slow end) | Gentle fade to normal |
| Total | 1000ms | - | Complete animation cycle |

## Trigger Conditions

Animation triggers when:
1. ✅ New turn is detected (history length increases)
2. ✅ Turn includes a valid cell coordinate
3. ✅ Component receives updated state via `ngOnChanges`

Animation does **not** trigger:
- ❌ On initial page load (no history change)
- ❌ On reconnect (history length doesn't increase)
- ❌ On state updates without new turns

## State Management

### Tracking Variables

```typescript
private explodingCells: Set<string> = new Set();  // Active explosions
private lastHistoryLength: number = 0;           // Previous history length
```

### Cleanup

- Explosion class removed after 1000ms (matches animation duration)
- Set automatically cleaned up via `setTimeout`
- No memory leaks - old animations are removed

## Performance Considerations

### Efficient Detection
- Only checks history length (O(1) operation)
- Uses Set for O(1) lookup in `getCellClasses`
- Minimal overhead per render

### Animation Performance
- CSS animations (GPU-accelerated)
- No JavaScript-based animations
- Runs on compositor thread

### Memory Management
- Single timeout per cell
- Automatic cleanup after animation
- No accumulation of old animation states

## Customization

### Adjust Flash Speed

Change the keyframe percentage:

```scss
@keyframes cell-explode {
  0% { /* start */ }
  10% { /* faster flash (was 15%) */ }
  100% { /* end */ }
}
```

### Adjust Total Duration

```typescript
// In component
setTimeout(() => {
  this.explodingCells.delete(cellKey);
}, 800); // Shorter duration (was 1000)
```

```scss
// In CSS
.cell-exploding {
  animation: cell-explode 0.8s ease-out forwards;
}
```

### Change Glow Intensity

```scss
@keyframes cell-explode {
  15% {
    box-shadow: 0 0 30px rgba(255, 255, 255, 1),    // Brighter
                0 0 60px rgba(255, 255, 255, 0.6);  // Larger
  }
}
```

### Add Color Tint

For player-specific explosion colors:

```scss
@keyframes cell-explode {
  15% {
    background: rgba(255, 200, 100, 1); // Orange tint
    box-shadow: 0 0 20px rgba(255, 200, 100, 0.8);
  }
}
```

## Example Timeline

```
Turn played at time T:
├─ T+0ms:   History updates, ngOnChanges triggered
├─ T+0ms:   Cell added to explodingCells Set
├─ T+0ms:   Animation starts (background at 20% opacity)
├─ T+150ms: Peak brightness (full white + glow)
├─ T+300ms: Fading (50% back to normal)
├─ T+600ms: Fading (80% back to normal)
├─ T+1000ms: Animation complete, class removed
└─ T+1000ms: Cell returns to static played state
```

## Browser Compatibility

- ✅ Modern browsers (Chrome, Firefox, Safari, Edge)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)
- ✅ CSS animations widely supported
- ✅ Graceful degradation (no animation = instant state change)

## Future Enhancements

Possible improvements:
- Player-specific explosion colors
- Hit vs miss different animations
- Sound effects on explosion
- Particle effects using CSS pseudo-elements
- Multiple cells exploding in sequence
- Configurable animation speed/intensity

## Summary

The cell explosion animation provides:
- ✅ Instant visual feedback on turn plays
- ✅ Smooth, professional animation
- ✅ Performant GPU-accelerated effects
- ✅ Automatic cleanup and state management
- ✅ Easy customization via CSS
- ✅ Works with all existing cell states (hits, sinks, setup)
