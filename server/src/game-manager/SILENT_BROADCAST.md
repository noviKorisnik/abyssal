# Game Manager - Silent Broadcast Simulation

## Overview

The GameManager includes a built-in **silent broadcast simulation** feature that allows the game to auto-play a configurable number of turns at the start before clients receive any broadcasts. This is useful for testing end-game scenarios without manually playing through the entire game.

## How It Works

When enabled, the game:
1. Starts normally when all players join
2. Auto-plays turns silently (zero turn time limit)
3. Suppresses broadcasts to clients during simulation
4. Automatically switches to normal mode after reaching the target turn count
5. Clients then receive the first broadcast showing the simulated game state

## Configuration

### Fields in GameManager

```typescript
private silentBroadcast: boolean = true;  // Enable/disable simulation
private silentBroadcastCount: number = 48; // Number of turns to simulate
```

### Default Settings

- **Enabled by default**: `silentBroadcast = true`
- **Simulation turns**: `48` (out of 64 total possible on 8×8 board)
- **Effect**: Simulates ~75% of a typical game before broadcasting

### To Disable (Normal Game Mode)

Set `silentBroadcast` to `false`:

```typescript
private silentBroadcast: boolean = false; // Normal mode - no simulation
```

### To Configure Turn Count

Change `silentBroadcastCount`:

```typescript
private silentBroadcastCount: number = 32; // Simulate first 32 turns
// OR
private silentBroadcastCount: number = 56; // Simulate first 56 turns (near end-game)
```

## Implementation Details

### 1. Turn Time Limit

During silent broadcast, turn time limit is set to **zero** to trigger immediate auto-play:

```typescript
private get turnTimeLimit() {
    return this.silentBroadcast ? 0 : (this.config.turnSeconds ?? 30) * 1000;
}
```

### 2. Broadcast Suppression

Broadcasts are suppressed until the target turn count is reached. The message is only constructed when actually broadcasting (optimization):

```typescript
private isFullBroadcast() {
    if (!this.silentBroadcast) return true;
    if (this.state !== 'active') return true;
    if (this.historyState && this.historyState.length >= this.silentBroadcastCount) 
        this.silentBroadcast = false;
    return !this.silentBroadcast;
}

private broadcast() {
    if (this.isFullBroadcast()) {
        const message: GameStatusMessage = {
            type: 'state',
            phase: this.state,
            gameId: this.id,
            players: this.playerList(),
            ready: this.readyState,
            active: this.activeState,  // ← Includes currentPlayerId
            done: this.doneState,
            history: this.historyState,
            boardLayout: this.boardLayoutState,
        };
        const msg = JSON.stringify(message);
        
        for (const sock of this.sockets) {
            try { sock.send(msg); } catch (err) { }
        }
    }
}
```

**Key optimization**: Message construction happens inside `isFullBroadcast()` check, so `activeState` (with `currentPlayerId`) is only calculated when actually broadcasting. This ensures the first broadcast after simulation has the correct active player information.

### 3. Automatic Mode Switch

When the turn count reaches `silentBroadcastCount`, the mode automatically switches:
- `silentBroadcast` is set to `false`
- Turn time limit becomes normal (e.g., 15 seconds)
- Broadcasts start sending to clients
- Game continues normally from that point

## Simulation Behavior

### What Happens During Silent Broadcast

1. **Turn timer triggers immediately** (0ms limit)
2. **`handleTurnTimeout()` is called** for each turn
3. **Random valid cell is auto-picked** for current player
4. **Move is processed normally** through game logic:
   - Hits and sinks detected
   - Board state updated
   - Eliminations tracked
   - Turn history recorded
5. **Next turn begins** with zero delay
6. **No broadcasts sent** to clients
7. **Process repeats** until target turn count reached

### After Silent Broadcast Ends

8. **First broadcast sent** with complete game state:
   - Full turn history (all 48+ turns)
   - Current board layout
   - Player eliminations
   - Sunk ships
9. **Normal gameplay begins** with regular turn timers
10. **Clients see** a game already in progress/near-end state

## Use Cases

### Testing End-Game Scenarios

**Configuration:**
```typescript
private silentBroadcast: boolean = true;
private silentBroadcastCount: number = 56; // Very near end-game
```

**Result:** Game fast-forwards to turn 56, likely with 1-2 players eliminated and others with few ships remaining.

### Testing Mid-Game State

**Configuration:**
```typescript
private silentBroadcast: boolean = true;
private silentBroadcastCount: number = 32; // Mid-game
```

**Result:** Game starts at turn 32, roughly halfway through a typical game.

### Testing Specific Turn Count

**Configuration:**
```typescript
private silentBroadcast: boolean = true;
private silentBroadcastCount: number = 20; // Early-mid game
```

**Result:** Test specific game phases by choosing appropriate turn counts.

### Normal Production Mode

**Configuration:**
```typescript
private silentBroadcast: boolean = false; // DISABLE simulation
private silentBroadcastCount: number = 48; // (ignored when disabled)
```

**Result:** Game plays normally from turn 1 with broadcasts to all clients.

## Console Output

During simulation, you'll see rapid console logs:

```
Turn timeout for player player-1, auto-picking cell (3,2)
Player player-2 eliminated at turn 28
Turn timeout for player player-3, auto-picking cell (5,7)
...
```

When simulation ends (turn 48), normal broadcasts begin and clients connect.

## Advantages

✅ **Minimal Code**: Just 2 fields and a few conditionals
✅ **Integrated**: Uses existing turn timeout mechanism
✅ **Fast**: Zero delay between turns during simulation
✅ **Complete History**: Full turn-by-turn history preserved
✅ **Realistic States**: Actual game logic produces realistic board states
✅ **Easy Toggle**: Single boolean to enable/disable
## Advantages

✅ **Minimal Code**: Just 2 fields and a few conditionals
✅ **Integrated**: Uses existing turn timeout mechanism
✅ **Fast**: Zero delay between turns during simulation
✅ **Complete History**: Full turn-by-turn history preserved
✅ **Realistic States**: Actual game logic produces realistic board states
✅ **Easy Toggle**: Single boolean to enable/disable
✅ **Configurable**: Adjust turn count for different scenarios
✅ **Optimized**: Message only built when actually broadcasting (no wasted computation)
✅ **Correct State**: First broadcast has accurate active player information
✅ **No Client Changes**: Clients receive normal game state via existing protocol

## Development Workflow

### Enable for Testing
1. Set `silentBroadcast = true`
2. Set `silentBroadcastCount` to desired turn count
3. Rebuild server: `npm run build`
4. Start server: `npm run dev`
5. Join with 4 clients
6. Game auto-simulates to target turn
7. Test end-game features immediately

### Disable for Production
1. Set `silentBroadcast = false`
2. Rebuild and deploy
3. Games play normally from turn 1

## Troubleshooting

**Issue**: Simulation seems to stop early
- **Check**: Game might have ended naturally (all but one player eliminated)
- **Solution**: Lower `silentBroadcastCount` or accept natural end

**Issue**: Clients don't see any game state
- **Check**: `silentBroadcast` might still be `true` with very high turn count
- **Solution**: Verify turn count is reachable before game naturally ends

**Issue**: Simulation takes too long
- **Note**: Zero turn limit means simulation is nearly instant (microseconds per turn)
- **Check**: Network or other processing delays

## Technical Notes

- **Board Size**: 8×8 = 64 cells maximum
- **Typical Game Length**: 40-60 turns
- **Recommended Range**: 32-56 turns for testing
- **Turn 48**: ~75% of typical game, good balance for end-game testing
- **Performance**: 48 turns simulate in <100ms typically

## Example Scenarios

| Turn Count | Game Phase | Typical State |
|------------|------------|---------------|
| 16 | Early | All players active, 8-10 ships each |
| 32 | Mid | 3-4 players, 5-8 ships each |
| 48 | Late-Mid | 2-3 players, 2-5 ships each |
| 56 | Near-End | 1-2 players, 1-3 ships each |
| 60+ | End-Game | 1 player or game finished |

## Summary

The silent broadcast feature provides a simple, built-in way to fast-forward games for testing without external tools or complex setup. Just toggle the boolean and set the turn count - the game handles the rest automatically.
