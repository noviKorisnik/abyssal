import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { gameConfigRouter } from './game-config';
import { gameManagerRouter, handleGameManagerSocket } from './game-manager';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

app.use(express.json());

app.use('/api/game-config', gameConfigRouter);
app.use('/api/game-manager', gameManagerRouter);


// Delegate all WebSocket connections to game manager handler
wss.on('connection', (ws) => {
  handleGameManagerSocket(ws);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Abyssal server listening on port ${PORT}`);
});
