export interface ShipType {
  name: string;
  size: number;
  count: number;
}

export interface GameConfig {
  boardRows: number;
  boardCols: number;
  shipTypes: ShipType[];
  minPlayers: number;
  maxPlayers: number;
  lobbyWaitSeconds: number;
  turnSeconds: number;
}
