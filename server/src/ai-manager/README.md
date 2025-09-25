# AI Manager (Server)

This feature provides AI player management and creation for server-side games.

## Purpose
- Creates AI players with valid game setups for use in multiplayer games.
- AI players use an in-memory socket-like interface for communication with the game manager.
- Supports future extension for smarter AI logic or external providers.

## Usage
Import from the barrel:
```ts
import { AIManager } from './ai-manager';
```
Create an AI player:
```ts
const aiPlayer = AIManager.createAIPlayer(config);
```

## Structure
- `ai-manager.ts`: Main manager class
- `ai-player.ts`: AI player class (socket-like interface)
- `index.ts`: Barrel export
- `README.md`: This documentation

## Notes
- AI players are indistinguishable from regular players in game logic, except for communication.
- Extend `AIPlayer` for more advanced AI behaviors as needed.
