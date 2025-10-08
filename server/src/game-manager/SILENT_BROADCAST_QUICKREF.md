# Silent Broadcast - Quick Reference

## Enable/Disable

```typescript
// server/src/game-manager/game-manager.ts

// ENABLE (for testing)
private silentBroadcast: boolean = true;

// DISABLE (for production)
private silentBroadcast: boolean = false;
```

## Configure Turn Count

```typescript
private silentBroadcastCount: number = 48;  // Default (75% of game)
private silentBroadcastCount: number = 32;  // Mid-game
private silentBroadcastCount: number = 56;  // Near end-game
```

## Common Scenarios

| Scenario | silentBroadcast | silentBroadcastCount | Result |
|----------|----------------|---------------------|---------|
| **Normal Game** | `false` | (any) | No simulation, game starts at turn 1 |
| **End-Game Test** | `true` | `48-56` | Start near end with few ships remaining |
| **Mid-Game Test** | `true` | `32` | Start halfway through typical game |
| **Quick Test** | `true` | `20` | Start early-mid game |

## Quick Test Workflow

1. Edit `game-manager.ts`:
   ```typescript
   private silentBroadcast: boolean = true;
   private silentBroadcastCount: number = 48;
   ```

2. Rebuild: `npm run build`

3. Start server: `npm run dev`

4. Join with 4 clients

5. Game auto-simulates to turn 48

6. Test end-game features immediately!

## Remember to Disable!

Before committing or deploying:
```typescript
private silentBroadcast: boolean = false; // ← Set to false!
```

## Full Documentation

See [SILENT_BROADCAST.md](./SILENT_BROADCAST.md) for complete details.
