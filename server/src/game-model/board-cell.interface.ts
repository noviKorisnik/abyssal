export interface BoardCell {
  row: number;
  col: number;
  shipId?: string;
  hit?: boolean;
}
