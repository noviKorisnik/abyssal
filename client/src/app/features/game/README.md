# Game Feature

Manages the game interface, board rendering, and real-time gameplay interactions.

## Responsibilities

- Game board rendering and interaction
- Real-time game state display
- Move input and validation
- WebSocket connection management for game events
- Game result display

## Components

- `GameComponent` - Main game container
- `GameBoardComponent` - Interactive game board
- `GameStatusComponent` - Game status and turn indicator
- `GameChatComponent` - In-game chat functionality

## Services

- `GameService` - Game state management and API calls
- `GameWebSocketService` - Real-time communication
- `GameBoardService` - Board logic and validation

## Models

- `Game` - Game state model
- `GameMove` - Move representation
- `GameBoard` - Board state model
- `Player` - Player information

## Routes

- `/game/:id` - Active game view
- `/game/:id/spectate` - Spectator view