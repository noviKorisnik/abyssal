import { GameConfig } from './game-config.model';

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
