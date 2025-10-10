# Random AI Provider - Quick Reference

## What It Does

Simple AI that makes random valid moves with 1-5 second delays.

## Key Features

- ✅ Automatic: Fills games when not enough humans
- ✅ Fast response: 1-5 seconds (vs 15s timeout)
- ✅ Valid moves: Only picks unplayed cells
- ✅ Realistic: Pauses before moving like human

## How AI Joins

```typescript
// Automatic in GameManager.activateGame()
if (players.length < minPlayers) {
  injectAIPlayers(minPlayers - players.length);
}
```

## AI Turn Flow

```
1. State broadcast → AIPlayer.send()
2. Check: Is it my turn?
3. Wait: Random 1-5 seconds
4. Scan: Find unplayed cells
5. Pick: Random valid cell
6. Send: pickCell message
```

## Code Entry Points

### AIManager (ai-manager.ts)
```typescript
static createAIPlayer(config): AIPlayer
// Creates AI with random setup and name
```

### AIPlayer (ai-player.ts)
```typescript
send(data: any)
// Receives broadcasts, detects turn, makes move

setGameManagerCallback(callback)
// Sets callback to send moves to game manager
```

### GameManager (game-manager.ts)
```typescript
injectAIPlayers(count: number)
// Adds AI players and sets up callbacks
```

## Testing

1. Start game with 1 player (need 2 minimum)
2. AI joins automatically
3. Observe: "AI {Adjective} {Noun}" appears
4. Watch AI make moves after 1-5 second pauses

## Timing

| Action | Delay |
|--------|-------|
| AI thinking | 1-5 seconds (random) |
| Timeout fallback | 15 seconds |
| AI average | ~3 seconds |

## Logs

```
[AIPlayer AI Swift Dragon] Thinking... (3421ms)
[AIPlayer AI Swift Dragon] Playing cell (5, 7)
```

## Limitations

- ❌ No strategy (random only)
- ❌ No difficulty levels
- ❌ No learning or memory
- ✅ Perfect for baseline testing

## Future Enhancements

- Smart AI with probability analysis
- LLM-based strategic AI
- Difficulty levels (easy/medium/hard)
- Pluggable AI provider architecture
