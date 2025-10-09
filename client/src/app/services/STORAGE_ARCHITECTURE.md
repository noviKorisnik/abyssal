# Storage Abstraction & Game State Management

## Overview

This document describes the storage abstraction layer and game state management system that provides:
1. **Environment-aware storage**: localStorage for production, sessionStorage for development
2. **Game ID storage**: gameId stored in browser storage instead of URL path
3. **Automatic cleanup**: gameId cleared when game ends or user leaves

## Architecture

### 1. StorageService (Abstraction Layer)

**Location**: `client/src/app/services/storage.service.ts`

Provides a unified interface that automatically selects the appropriate storage backend:
- **Production** (`environment.production === true`): Uses `localStorage` for persistence across sessions
- **Development** (`environment.production === false`): Uses `sessionStorage` for isolated testing

```typescript
@Injectable({ providedIn: 'root' })
export class StorageService {
  private storage: Storage;

  constructor() {
    // Automatic selection based on environment
    this.storage = environment.production ? localStorage : sessionStorage;
  }

  getItem(key: string): string | null { ... }
  setItem(key: string, value: string): void { ... }
  removeItem(key: string): void { ... }
  clear(): void { ... }
  hasItem(key: string): boolean { ... }
  keys(): string[] { ... }
}
```

**Benefits**:
- Single point of configuration
- Easy to test with different storage backends
- Consistent API across the application
- No direct storage references in components/services

### 2. GameStateService (Game ID Management)

**Location**: `client/src/app/services/game-state.service.ts`

Manages the current game ID with reactive updates:

```typescript
@Injectable({ providedIn: 'root' })
export class GameStateService {
  private gameIdSubject: BehaviorSubject<string | null>;

  constructor(private storage: StorageService) {
    const storedGameId = this.storage.getItem('abyssal_current_game_id');
    this.gameIdSubject = new BehaviorSubject<string | null>(storedGameId);
  }

  getGameId$(): Observable<string | null> { ... }
  getGameId(): string | null { ... }
  setGameId(gameId: string): void { ... }
  clearGameId(): void { ... }
  hasActiveGame(): boolean { ... }
}
```

**Features**:
- Observable pattern for reactive updates
- Automatic persistence via StorageService
- Centralized game state management

## Storage Keys

| Key | Service | Purpose | Lifecycle |
|-----|---------|---------|-----------|
| `userId` | UserService | User identifier (UUID) | Permanent |
| `abyssal_player_name` | PlayerNameService | User's chosen player name | Permanent |
| `abyssal_current_game_id` | GameStateService | Active game ID | Cleared on game end |

## Migration from URL-based to Storage-based Game ID

### Before (URL-based)
```
Route: /game/:gameId
URL: http://localhost:4200/game/abc123xyz
```

**Issues**:
- GameId visible in URL (could be manually edited)
- Sharing URL might not work as intended
- Browser history cluttered with game IDs
- No automatic cleanup

### After (Storage-based)
```
Route: /game
URL: http://localhost:4200/game
```

**Advantages**:
- ✅ Clean URLs
- ✅ GameId stored securely in browser storage
- ✅ Automatic cleanup when game ends
- ✅ No manual URL manipulation possible
- ✅ Better UX - no visible IDs

## Component Updates

### GameSetupComponent

**Before**:
```typescript
this.router.navigate(['/game', gameId]);
```

**After**:
```typescript
// Store gameId in storage
this.gameStateService.setGameId(gameId);
// Navigate without gameId in URL
this.router.navigate(['/game']);
```

### GameComponent

**Before**:
```typescript
// Get from route parameter
this.gameId = this.route.snapshot.paramMap.get('gameId') || '';
```

**After**:
```typescript
// Get from storage
this.gameId = this.gameStateService.getGameId() || '';

if (!this.gameId) {
  // No active game, redirect home
  this.router.navigate(['/']);
  return;
}
```

**Cleanup on exit**:
```typescript
onLeaveRoom() {
  if (this.socket) {
    this.socket.send({ type: 'exit', ... });
  }
  this.gameStateService.clearGameId(); // Clear storage
}

onNewGame() {
  this.gameStateService.clearGameId(); // Clear before creating new
  this.router.navigate(['/game-setup']);
}

onGoHome() {
  this.gameStateService.clearGameId(); // Clear on navigation
  this.router.navigate(['/']);
}
```

## Service Migration

All services updated to use `StorageService`:

### UserService
```typescript
constructor(private storage: StorageService) {
  let id = this.storage.getItem('userId');
  // ...
}
```

### PlayerNameService
```typescript
constructor(
  private http: HttpClient,
  private storage: StorageService
) {}

getStoredPlayerName(): string | null {
  return this.storage.getItem('abyssal_player_name');
}
```

## Environment Configuration

### environment.ts (Development)
```typescript
export const environment = {
  apiBaseUrl: '/api',
  wsBaseUrl: '/ws',
  production: false, // sessionStorage
};
```

### environment.production.ts (Production)
```typescript
export const environment = {
  apiBaseUrl: '/api',
  wsBaseUrl: '/ws',
  production: true, // localStorage
};
```

## Testing Strategy

### Development Testing
- Uses `sessionStorage` - isolated per browser tab
- Great for testing multiple game instances simultaneously
- Automatic cleanup when tab closes

### Production Behavior
- Uses `localStorage` - persists across sessions
- User can close browser and return to active game
- Manual cleanup required (implemented via clearGameId())

## Game Lifecycle Flow

```
1. User completes setup
   ↓
2. GameSetupComponent receives gameId from server
   ↓
3. GameStateService.setGameId(gameId) stores in storage
   ↓
4. Navigate to /game (no ID in URL)
   ↓
5. GameComponent reads gameId from storage
   ↓
6. Game plays...
   ↓
7. Game ends OR user leaves
   ↓
8. GameStateService.clearGameId() removes from storage
   ↓
9. Navigate to home or game-setup
```

## Benefits Summary

### For Development
- ✅ Isolated testing sessions (sessionStorage)
- ✅ Multiple tabs with different games
- ✅ Automatic cleanup on tab close
- ✅ No storage pollution between sessions

### For Production
- ✅ Persistent game state (localStorage)
- ✅ Survive browser refresh/crash
- ✅ Better user experience
- ✅ Clean URLs

### For Both
- ✅ Single, consistent API (StorageService)
- ✅ Easy to swap storage backends
- ✅ Centralized storage logic
- ✅ Type-safe service layer
- ✅ Reactive updates via Observables

## Future Enhancements

Possible additions:
- Storage quota checking
- Automatic fallback if storage is disabled
- Encrypted storage for sensitive data
- Storage event listeners for multi-tab sync
- TTL (time-to-live) for stored items
