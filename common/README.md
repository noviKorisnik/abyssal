# Abyssal Common

Shared types, interfaces, and utilities used by both the Abyssal server and client.

## Structure

```
src/
├── types/          # Type definitions
├── interfaces/     # Interface definitions  
├── utils/          # Shared utility functions
└── index.ts        # Main export file
```

## Usage

### In Server
```typescript
import { GameState, Player } from '@abyssal/common';
```

### In Client
```typescript
import { GameState, Player } from '@abyssal/common';
```

## Development

```bash
npm run build      # Build TypeScript
npm run dev        # Watch mode
npm test          # Run tests
```

## Types and Interfaces

### Game Types
- `GameState` - Complete game state representation
- `GameStatus` - Game status enumeration
- `GameMove` - Player move representation

### Player Types
- `Player` - Player information
- `PlayerStats` - Player statistics

### Board Types
- `Board` - Game board representation
- `Cell` - Individual board cell
- `Ship` - Ship placement and state

### WebSocket Events
- `ClientEvents` - Events sent from client to server
- `ServerEvents` - Events sent from server to client