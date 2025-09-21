import { WebSocket } from "ws";

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
        ws.send(JSON.stringify({ type: 'error', error: 'Unknown message type' }));
    }
  });

  ws.send(JSON.stringify({ type: 'welcome', message: 'Welcome to Abyssal Game Manager WebSocket!' }));
}

function handleJoin(ws: WebSocket, data: any) {
    console.log(`[WS] Join request: userId=${data.userId}, gameId=${data.gameId}`, data);
  // Example: assign player to room and send lobby state
  // You may want to validate data here
  // const manager = GameManager.assignPlayerToRoom(data);
  // ws.send(JSON.stringify({ type: 'lobby', gameId: manager.id, players: manager['players'] }));
  // console.log(`[WS] Player joined: userId=${data.userId}, gameId=${manager.id}`);
  ws.send(JSON.stringify({ type: 'lobby', message: 'Join handler not yet implemented.' }));
}
