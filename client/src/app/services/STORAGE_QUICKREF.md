# Storage & Game State - Quick Reference

## Services

### StorageService
**Purpose**: Environment-aware storage abstraction
**Location**: `client/src/app/services/storage.service.ts`

```typescript
// Auto-selects: localStorage (prod) or sessionStorage (dev)
storage.getItem(key: string): string | null
storage.setItem(key: string, value: string): void
storage.removeItem(key: string): void
storage.clear(): void
storage.hasItem(key: string): boolean
storage.keys(): string[]
```

### GameStateService
**Purpose**: Manage current game ID
**Location**: `client/src/app/services/game-state.service.ts`

```typescript
gameState.getGameId(): string | null
gameState.getGameId$(): Observable<string | null>
gameState.setGameId(gameId: string): void
gameState.clearGameId(): void
gameState.hasActiveGame(): boolean
```

## Storage Keys

| Key | Service | Cleared When |
|-----|---------|--------------|
| `userId` | UserService | Never (permanent) |
| `abyssal_player_name` | PlayerNameService | Manual only |
| `abyssal_current_game_id` | GameStateService | Game ends/leave |

## URL Changes

**Before**: `/game/:gameId` → `http://localhost/game/abc123xyz`
**After**: `/game` → `http://localhost/game` (ID in storage)

## Key Changes

### GameSetupComponent
```typescript
// Store gameId and navigate
this.gameStateService.setGameId(gameId);
this.router.navigate(['/game']);
```

### GameComponent
```typescript
// Read gameId from storage
this.gameId = this.gameStateService.getGameId() || '';
if (!this.gameId) {
  this.router.navigate(['/']);
  return;
}

// Clear on exit
onLeaveRoom() {
  this.gameStateService.clearGameId();
}

onNewGame() {
  this.gameStateService.clearGameId();
  this.router.navigate(['/game-setup']);
}

onGoHome() {
  this.gameStateService.clearGameId();
  this.router.navigate(['/']);
}
```

## Environment Behavior

| Environment | Storage | Persistence | Use Case |
|-------------|---------|-------------|----------|
| Development | sessionStorage | Tab lifetime | Testing |
| Production | localStorage | Permanent | Users |

## Migration Checklist

- ✅ Created StorageService (abstraction)
- ✅ Created GameStateService (game ID management)
- ✅ Updated UserService to use StorageService
- ✅ Updated PlayerNameService to use StorageService
- ✅ Removed `:gameId` from game route
- ✅ Updated GameSetupComponent to store gameId
- ✅ Updated GameComponent to read from storage
- ✅ Added clearGameId() calls on exit paths
- ✅ Added production flag to environments

## Testing

### Development
```bash
# Open browser console
sessionStorage.getItem('abyssal_current_game_id') // Check game ID
sessionStorage.clear() // Clear all (simulates tab close)
```

### Production
```bash
# Open browser console
localStorage.getItem('abyssal_current_game_id') // Check game ID
localStorage.removeItem('abyssal_current_game_id') // Manual clear
```
