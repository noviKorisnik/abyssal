import { GameSetup } from './game-setup.interface';

export interface GamePlayer {
  userId: string;
  playerName?: string;
  setup: GameSetup;
}
