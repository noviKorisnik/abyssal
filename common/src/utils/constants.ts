export const BOARD_SIZE = 10;
export const SHIP_SIZES = {
  CARRIER: 5,
  BATTLESHIP: 4,
  CRUISER: 3,
  SUBMARINE: 3,
  DESTROYER: 2
} as const;

export const DEFAULT_SHIPS = [
  { type: 'CARRIER', count: 1 },
  { type: 'BATTLESHIP', count: 1 },
  { type: 'CRUISER', count: 1 },
  { type: 'SUBMARINE', count: 1 },
  { type: 'DESTROYER', count: 1 }
] as const;