# Random AI Provider Implementation

## Overview

Implements a simple "random AI provider" that makes valid moves with realistic timing. This is the baseline AI implementation - not smart, just functional.

## Purpose

- **Fill games**: When not enough human players join
- **Testing**: Easy way to test full game flow
- **Baseline**: Foundation for future smart AI providers

## How It Works

### 1. AI Player Creation

```typescript
const aiPlayer = AIManager.createAIPlayer(config);
// Creates AI with:
// - Unique userId: AI_timestamp_counter
// - Random ship placement (valid setup)
// - Generated name: "AI {adjective} {noun}"
//   Example: "AI Swift Dragon", "AI Bold Phoenix"
```

### 2. Turn Detection

AI player receives game state broadcasts like any player:

```typescript
send(data: any) {
  const message = JSON.parse(data);
  
  // Check if it's AI's turn
  if (message.type === 'state' && 
      message.phase === 'active' &&
      message.active?.currentPlayerId === this.userId) {
    this.scheduleMove(message);
  }
}
```

### 3. Move Scheduling

Random delay between 1-5 seconds for realistic behavior:

```typescript
scheduleMove(gameState) {
  // Random delay: 1000-5000ms (1-5 seconds)
  const delay = Math.floor(Math.random() * 4000) + 1000;
  
  setTimeout(() => {
    this.makeMove(gameState);
  }, delay);
}
```

### 4. Move Selection

Completely random from available cells:

```typescript
makeMove(gameState) {
  // 1. Scan board for unplayed cells
  const availableCells = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (baseBoard[y][x] === 0) { // 0 = not played
        availableCells.push({ x, y });
      }
    }
  }
  
  // 2. Pick random cell
  const randomIndex = Math.floor(Math.random() * availableCells.length);
  const cell = availableCells[randomIndex];
  
  // 3. Send move to game manager
  this.gameManagerCallback({
    type: 'pickCell',
    gameId: gameState.gameId,
    userId: this.userId,
    cell
  });
}
```

## Communication Flow

```
Game Manager broadcasts state
         ↓
AIPlayer.send(state) receives broadcast
         ↓
Detects: message.active.currentPlayerId === AI's userId
         ↓
Schedules move with random delay (1-5s)
         ↓
setTimeout fires
         ↓
AI scans board for available cells
         ↓
Picks random cell
         ↓
Calls gameManagerCallback({ type: 'pickCell', ... })
         ↓
Game Manager.dispatch(message)
         ↓
Game Manager processes move like any player
```

## Integration with Game Manager

### AI Injection

```typescript
// In GameManager.activateGame()
if (this.players.length < minPlayers) {
  const aiCount = minPlayers - this.players.length;
  this.injectAIPlayers(aiCount);
}

// In GameManager.injectAIPlayers()
const aiPlayer = AIManager.createAIPlayer(this.config);

// Set up callback for AI to send messages back
aiPlayer.setGameManagerCallback((message) => {
  this.dispatch(message);
});

this.players.push(aiPlayer);
this.sockets.add(aiPlayer);
```

### Message Handling

AI uses the same `dispatch` flow as WebSocket players:
- No special handling needed
- Same validation (turn ownership, cell validity)
- Same game logic applied

## Timing Comparison

| Event | Human Player | AI Player | Server Timeout |
|-------|-------------|-----------|----------------|
| Turn starts | Thinks 0-15s | Thinks 1-5s | 15s max |
| Average response | ~8s | ~3s | N/A |
| Timeout trigger | After 15s | Never (responds faster) | 15s |

**Benefits**:
- ✅ AI responds faster than timeout (1-5s vs 15s)
- ✅ More engaging for human players
- ✅ Realistic pause simulates thinking
- ✅ Games progress at better pace

## AI Characteristics

### What It Does

✅ **Makes valid moves** - Always picks unplayed cells
✅ **Realistic timing** - Pauses 1-5 seconds like human
✅ **Never times out** - Responds faster than 15s limit
✅ **Full integration** - Uses same game logic as humans
✅ **Clean cleanup** - Clears timeouts on state changes

### What It Doesn't Do

❌ **No strategy** - Purely random selection
❌ **No learning** - Same behavior every game  
❌ **No ship memory** - Doesn't track where ships might be
❌ **No probability** - Doesn't analyze hit patterns
❌ **No difficulty levels** - Single skill level

## Error Handling

### No Available Cells
```typescript
if (availableCells.length === 0) {
  console.warn(`[AIPlayer] No available cells`);
  return; // Gracefully abort
}
```

### Invalid Board State
```typescript
if (!boardLayout || !boardLayout.baseBoard) {
  console.warn(`[AIPlayer] No board layout`);
  return;
}
```

### Cleanup on State Change
```typescript
send(data: any) {
  // Clear any pending move
  if (this.moveTimeout) {
    clearTimeout(this.moveTimeout);
    this.moveTimeout = undefined;
  }
  // ... process new state
}
```

## Future: Smart AI Providers

The architecture is ready for pluggable AI providers:

```typescript
// Future interface
interface AIProvider {
  name: string;
  chooseMove(gameState: any, playerSetup: GameSetup): Cell | Promise<Cell>;
}

// Random provider (current implementation)
class RandomAIProvider implements AIProvider {
  name = 'Random';
  chooseMove(state, setup) {
    return pickRandomValidCell(state);
  }
}

// Future: Probability-based AI
class SmartAIProvider implements AIProvider {
  name = 'Smart';
  chooseMove(state, setup) {
    // Analyze hit patterns
    // Calculate probabilities
    // Target likely ship locations
    return optimalCell;
  }
}

// Future: LLM-based AI
class LLMAIProvider implements AIProvider {
  name = 'LLM';
  async chooseMove(state, setup) {
    // Call Azure OpenAI or other LLM
    // Provide game context as prompt
    // Parse strategic response
    return await aiSuggestedCell;
  }
}

// Usage
AIManager.registerProvider('random', randomProvider);
AIManager.registerProvider('smart', smartProvider);
AIManager.registerProvider('llm', llmProvider);

const aiPlayer = AIManager.createAIPlayer(config, 'smart');
```

## Testing

### Manual Testing
1. Start game with 1 human player (minPlayers = 2)
2. Observe AI player joining automatically
3. Watch AI make moves with 1-5 second delays
4. Verify AI never picks already-played cells
5. Check AI responds faster than 15s timeout

### Expected Behavior
- AI joins with name like "AI Swift Dragon"
- AI appears in player list
- When AI's turn: pause 1-5 seconds, then move
- Moves are valid (unpicked cells only)
- Game progresses smoothly

### Edge Cases
- AI eliminated: stops making moves ✅
- Multiple AI players: each thinks independently ✅
- Rapid state changes: old timeouts cleared ✅
- No available cells: graceful abort ✅

## Performance

### Memory
- Minimal overhead per AI player
- Single timeout per AI at most
- No persistent state beyond game

### CPU
- Board scan: O(rows × cols) per move
- Random selection: O(1)
- No complex calculations
- Negligible impact

### Network
- No network calls (in-memory)
- Same message count as human player
- No additional broadcasts

## Logs

```
[AIPlayer AI Swift Dragon] Thinking... (3421ms)
[AIPlayer AI Swift Dragon] Playing cell (5, 7)
```

Logs help track AI behavior and debug issues.

## Benefits

✅ **Games start faster** - No need to wait for 4 humans
✅ **Better testing** - Easy to test multiplayer features
✅ **Improved UX** - Faster response than timeout
✅ **Realistic behavior** - Pauses simulate thinking
✅ **Extensible** - Ready for smart AI in future
✅ **Reliable** - Always makes valid moves
✅ **Simple** - Easy to understand and maintain

## Limitations (Intentional)

The random AI provider is intentionally simple:
- No strategy (baseline for future comparison)
- No difficulty settings (future enhancement)
- No learning (future smart AI)
- Synchronous only (future async LLM support)

These limitations establish a baseline. Future AI providers will build on this foundation with smarter strategies while maintaining the same clean integration.
