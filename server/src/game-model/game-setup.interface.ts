import { BoardCell } from './board-cell.interface';
import { PlacedShip } from './placed-ship.interface';
import { GameConfig } from '../game-config/game-config.model';

export interface GameSetup {
  board: BoardCell[][];
  ships: PlacedShip[];
  config: GameConfig;
}
