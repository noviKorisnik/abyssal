# Game Feature

Manages game sessions, state, and gameplay logic for Abyssal naval battles.

## Responsibilities

- Game session creation and management
- Game state tracking
- Turn-based gameplay coordination
- Battle resolution
- Win/loss condition checking

## API Endpoints

- `POST /api/games` - Create a new game
- `GET /api/games/:id` - Get game details
- `POST /api/games/:id/join` - Join a game
- `POST /api/games/:id/moves` - Make a move
- `GET /api/games/:id/state` - Get current game state

## WebSocket Events

### Client → Server
- `game:join` - Join a game session
- `game:move` - Make a move
- `game:ready` - Mark player as ready

### Server → Client
- `game:state` - Game state update
- `game:move` - Move notification
- `game:result` - Game result
- `game:error` - Game-related error

## Database Schema

### Game Entity
- `id` - Unique game identifier
- `status` - Game status (waiting, in_progress, completed)
- `players` - Array of player IDs
- `board` - Game board state
- `currentTurn` - Current player's turn
- `winner` - Winner ID (if completed)
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp