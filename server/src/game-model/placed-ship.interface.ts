export interface PlacedShip {
  id: string;
  type: string;
  size: number;
  cells: { row: number; col: number }[];
}
