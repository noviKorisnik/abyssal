# Game Setup Generator (Server)

This feature provides random game setup generation for AI and automated players on the server side.

## Purpose
- Generates valid board and ship placements for a given `GameConfig`.
- Used to inject AI players with valid setups when starting a game.
- Logic is adapted from the client, but kept local for simplicity and reliability.

## Usage
Import from the barrel:
```ts
import { generateGameSetup } from './game-setup';
```
Call with a valid `GameConfig`:
```ts
const setup = generateGameSetup(config);
```

## Structure
- `generate-game-setup.ts`: Main generator logic
- `index.ts`: Barrel export
- `README.md`: This documentation

## Notes
- No external dependencies; uses only project types/interfaces.
- If you update the client generator, copy changes here for consistency.
