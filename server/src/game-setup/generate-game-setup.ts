import { GameConfig } from '../game-config';
import { BoardCell, GameSetup, PlacedShip } from '../game-model';

function createEmptyBoard(rows: number, cols: number): BoardCell[][] {
    return Array.from({ length: rows }, (_, row) =>
        Array.from({ length: cols }, (_, col) => ({ row, col }))
    );
}

function isValidPlacement(board: BoardCell[][], cells: { row: number; col: number }[]): boolean {
    for (const { row, col } of cells) {
        if (
            row < 0 || row >= board.length ||
            col < 0 || col >= board[0].length ||
            board[row][col].shipId
        ) {
            return false;
        }
        // Check adjacent cells (including diagonals)
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                const nr = row + dr;
                const nc = col + dc;
                if (
                    nr >= 0 && nr < board.length &&
                    nc >= 0 && nc < board[0].length &&
                    board[nr][nc].shipId &&
                    !cells.some(c => c.row === nr && c.col === nc)
                ) {
                    return false;
                }
            }
        }
    }
    return true;
}

function placeShip(board: BoardCell[][], cells: { row: number; col: number }[], shipId: string) {
    for (const { row, col } of cells) {
        board[row][col].shipId = shipId;
    }
}

function removeShip(board: BoardCell[][], cells: { row: number; col: number }[]) {
    for (const { row, col } of cells) {
        delete board[row][col].shipId;
    }
}

function getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(arr: T[]): T[] {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = getRandomInt(0, i);
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

interface ShipToPlace {
    type: string;
    size: number;
}

function buildShipList(shipTypes: any[]): ShipToPlace[] {
    const ships: ShipToPlace[] = [];
    for (const st of shipTypes) {
        for (let i = 0; i < st.count; i++) {
            ships.push({ type: st.name, size: st.size });
        }
    }
    return shuffle(ships);
}

function generateShipPlacementsFlat(
    board: BoardCell[][],
    ships: ShipToPlace[],
    shipIndex: number,
    placedShips: PlacedShip[],
    shipIdCounter: { value: number },
    attemptCounter?: { value: number }
): boolean {
    if (shipIndex >= ships.length) {
        return true;
    }
    const ship = ships[shipIndex];
    const directions: Array<'H' | 'V'> = shuffle(['H', 'V'] as Array<'H' | 'V'>);
    const positions: { row: number; col: number; dir: 'H' | 'V' }[] = [];
    for (const dir of directions) {
        const maxRow = dir === 'H' ? board.length - 1 : board.length - ship.size;
        const maxCol = dir === 'H' ? board[0].length - ship.size : board[0].length - 1;
        for (let row = 0; row <= maxRow; row++) {
            for (let col = 0; col <= maxCol; col++) {
                positions.push({ row, col, dir });
            }
        }
    }
    shuffle(positions);
    for (const pos of positions) {
        if (attemptCounter) {
            attemptCounter.value++;
            if (attemptCounter.value > MAX_ATTEMPTS) {
                return false;
            }
        }
        const cells = Array.from({ length: ship.size }, (_, i) =>
            pos.dir === 'H' ? { row: pos.row, col: pos.col + i } : { row: pos.row + i, col: pos.col }
        );
        if (isValidPlacement(board, cells)) {
            const shipId = `ship-${shipIdCounter.value++}`;
            placeShip(board, cells, shipId);
            placedShips.push({ id: shipId, type: ship.type, size: ship.size, cells });
            if (generateShipPlacementsFlat(board, ships, shipIndex + 1, placedShips, shipIdCounter, attemptCounter)) {
                return true;
            }
            placedShips.pop();
            removeShip(board, cells);
        }
    }
    return false;
}

const MAX_ATTEMPTS = 65536;
const MAX_RETRIES = 8;

export function generateGameSetup(config: GameConfig, retryCount = 0, startTime?: number): GameSetup {
    if (retryCount === 0) {
        startTime = Date.now();
    }
    const board = createEmptyBoard(config.boardRows, config.boardCols);
    const placedShips: PlacedShip[] = [];
    const shipIdCounter = { value: 1 };
    const attemptCounter = { value: 0 };
    const ships = buildShipList(config.shipTypes);
    const success = generateShipPlacementsFlat(board, ships, 0, placedShips, shipIdCounter, attemptCounter);
    if (!success) {
        if (retryCount < MAX_RETRIES) {
            return generateGameSetup(config, retryCount + 1, startTime);
        } else {
            throw new Error(`Failed to generate valid board setup after ${attemptCounter.value} attempts and ${MAX_RETRIES} retries.`);
        }
    }
    return {
        board,
        ships: placedShips,
        config
    };
}
