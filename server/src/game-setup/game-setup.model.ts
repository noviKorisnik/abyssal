// Game setup feature models

import { GameConfig } from "../game-config/game-config.model";

export type GameState = 'ready' | 'active' | 'done';

export interface BoardCell {
  row: number;
  col: number;
  shipId?: string;
  hit?: boolean;
}

export interface PlacedShip {
  id: string;
  type: string;
  size: number;
  cells: { row: number; col: number }[];
}

export interface GameSetup {
  board: BoardCell[][];
  ships: PlacedShip[];
  config: GameConfig;
}

export interface GamePlayer {
  userId: string;
  setup: GameSetup;
}

export interface GameRoom {
  id: string;
  state: GameState;
  players: GamePlayer[];
  countdown?: number;
}
