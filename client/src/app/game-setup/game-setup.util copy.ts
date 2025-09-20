import { GameConfig } from './game-config.model';
import { GameSetup, PlacedShip, BoardCell } from './game-setup.model';

export function generateGameSetup(config: GameConfig): GameSetup {
  // Example: place one ship horizontally at top row
  const ship: PlacedShip = {
    id: 'ship-1',
    type: 'Battleship',
    size: 4,
    cells: [
      { row: 0, col: 0 },
      { row: 0, col: 1 },
      { row: 0, col: 2 },
      { row: 0, col: 3 }
    ]
  };

  // Create board and mark ship cells
  const board: BoardCell[][] = Array.from({ length: config.boardRows }, (_, row) =>
    Array.from({ length: config.boardCols }, (_, col) => {
      const cell: BoardCell = { row, col };
      if (ship.cells.some(c => c.row === row && c.col === col)) {
        cell.shipId = ship.id;
      }
      return cell;
    })
  );

  return {
    board,
    ships: [ship],
    config
  };
}
