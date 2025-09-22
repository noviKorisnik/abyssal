import { GameSetup } from './game-setup.interface';

export interface GamePlayer {
  userId: string;
  setup: GameSetup;
}
