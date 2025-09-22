import { GameState } from "./game-state.type";

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
  // Add other phase objects as needed, e.g.:
  // playing?: { ... }
  // finished?: { ... }
}