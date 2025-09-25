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
    GameManager.processMessage(ws, data);
  });
}
