# Abyssal Server

Node.js backend for Abyssal multiplayer naval strategy game.

## Features
- Vertical-slice architecture: each feature in its own folder with public entry point (`index.ts`)
- REST API (Express)
- WebSocket server (ws)
- TypeORM for database integration
- Modular service/repository layers
- AI adapters (scaffolding)

## Getting Started

1. Install dependencies:
   ```
   npm install
   ```
2. Run in development mode:
   ```
   npm run dev
   ```
3. Build and start production server:
   ```
   npm run build
   npm start
   ```

## Folder Structure
- `src/` – Source code
- `src/index.ts` – Main entry point
- `feature/` – Each feature in its own folder
```
server/
  src/
    game-config/
    lobby/
    board-setup/
    turn/
    ai-player/
    end-game/
    websocket/
    user/
    ...
```

## License
Apache License 2.0
