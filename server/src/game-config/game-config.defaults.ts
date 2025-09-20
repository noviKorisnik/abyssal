import { GameConfig } from "./game-config.model";

export const defaultGameConfig: GameConfig = {
  boardRows: 8,
  boardCols: 8,
  shipTypes: [
    { name: 'Battleship', size: 4, count: 1 },
    { name: 'Cruiser', size: 3, count: 2 },
    { name: 'Destroyer', size: 2, count: 3 },
    { name: 'Submarine', size: 1, count: 4 }
  ],
  minPlayers: 3,
  maxPlayers: 4,
  lobbyWaitSeconds: 60,
  turnSeconds: 15
};
