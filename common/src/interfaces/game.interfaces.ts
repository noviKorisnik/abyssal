export interface Player {
  id: string;
  name: string;
  isReady: boolean;
  isOnline: boolean;
}

export interface Game {
  id: string;
  status: import('../types/game.types').GameStatus;
  players: Player[];
  currentTurn?: string;
  winner?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Cell {
  x: number;
  y: number;
  status: import('../types/game.types').CellStatus;
  shipId?: string;
}

export interface Board {
  cells: Cell[][];
  ships: Ship[];
}

export interface Ship {
  id: string;
  type: import('../types/game.types').ShipType;
  length: number;
  position: {
    x: number;
    y: number;
  };
  orientation: import('../types/game.types').ShipOrientation;
  hits: number;
  isSunk: boolean;
}

export interface GameMove {
  playerId: string;
  x: number;
  y: number;
  timestamp: Date;
}

export interface GameState {
  game: Game;
  playerBoard?: Board;
  opponentBoard?: Board;
  moves: GameMove[];
}