import { WebSocket } from "ws";
import { GameManager } from "./game-manager";

export function handleGameManagerSocket(ws: WebSocket) {
  console.log('[WS] GameManager handler attached');

  ws.on('message', (message) => {
    let data: any;
    try {
      data = typeof message === 'string' ? JSON.parse(message) : JSON.parse(message.toString());
    } catch (err) {
      ws.send(JSON.stringify({ type: 'error', error: 'Invalid JSON' }));
      return;
    }

    switch (data.type) {
      case 'join':
        handleJoin(ws, data);
        break;
      // Add more cases for other message types
      default:
        // expected that other message types will be handled by GameManager instance
        // ws.send(JSON.stringify({ type: 'error', error: 'Unknown message type' }));
    }
  });

//   ws.send(JSON.stringify({ type: 'welcome', message: 'Welcome to Abyssal Game Manager WebSocket!' }));
}

function handleJoin(ws: WebSocket, data: any) {
    const manager = GameManager.getById(data.gameId);
    if (!manager) {
        ws.send(JSON.stringify({ type: 'error', error: 'Game not found' }));
        return;
    }
    manager.addSocket(ws, data.userId);
}
