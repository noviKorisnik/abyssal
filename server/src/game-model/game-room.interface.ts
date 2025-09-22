import { GamePlayer } from './game-player.interface';
import { GameState } from './game-state.type';

export interface GameRoom {
  id: string;
  state: GameState;
  players: GamePlayer[];
  countdown?: number;
}
