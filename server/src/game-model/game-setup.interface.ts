import { GameConfig } from '../game-config';
import { BoardCell } from './board-cell.interface';
import { PlacedShip } from './placed-ship.interface';

export interface GameSetup {
  board: BoardCell[][];
  ships: PlacedShip[];
  config: GameConfig;
}
