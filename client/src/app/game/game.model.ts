import { GameSetup } from "../game-setup/game-setup.model";

export type GameState = 'ready' | 'active' | 'done';

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
  active: boolean;
}

export interface BoardLayout {
  baseBoard: number[][];
  playerLayers: PlayerBoardLayer[];
}

export interface GameStatusMessage {
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


export interface GameRoom {
  gameId: string;
  player: {
    userId: string;
    setup: GameSetup;
  }
}