import { GameState } from "./game-state.type";


export interface GameTurn {
  playerId: string;
  cell: { x: number; y: number };
  hits: string[];
  sinks: string[];
}


export interface PlayerBoardLayer {
  playerId: string;
  revealedBoard: number[][];
  sunkShips: Array<{ shipId: string; cells: Array<{ x: number; y: number }> }>;
}

export interface BoardLayout {
  baseBoard: number[][]; // All played cells (0: not played, 1: played)
  playerLayers: PlayerBoardLayer[];
}


export interface GameStatusMessage {
  type: 'state';
  phase: GameState;
  gameId: string;
  players: Array<{ userId: string; connected: boolean }>;
  ready?: {
    waitTime: number;
    countdownTimer: number;
    quickStartEnabled: boolean;
  };
  active?: {
    currentPlayerId: string;
    turnTimeLimit: number;
    remainingTurnTime: number;
  };
  done?: {
    winnerId: string;
    placements: Array<{ userId: string; rank: number }>;
  };
  history?: GameTurn[];
  boardLayout?: BoardLayout;
}