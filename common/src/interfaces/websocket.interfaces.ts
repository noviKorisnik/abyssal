// WebSocket event interfaces for real-time communication

export interface ClientToServerEvents {
  // Game events
  'game:join': (gameId: string) => void;
  'game:move': (move: { x: number; y: number }) => void;
  'game:ready': () => void;
  'game:chat': (message: string) => void;
  
  // Connection events
  'ping': () => void;
  'player:update': (player: Partial<import('./game.interfaces').Player>) => void;
}

export interface ServerToClientEvents {
  // Game events
  'game:state': (gameState: import('./game.interfaces').GameState) => void;
  'game:move': (move: import('./game.interfaces').GameMove) => void;
  'game:result': (result: { winner: string; reason: string }) => void;
  'game:error': (error: { message: string; code?: string }) => void;
  'game:chat': (message: { playerId: string; message: string; timestamp: Date }) => void;
  
  // Connection events
  'pong': () => void;
  'player:joined': (player: import('./game.interfaces').Player) => void;
  'player:left': (playerId: string) => void;
  'player:updated': (player: import('./game.interfaces').Player) => void;
}