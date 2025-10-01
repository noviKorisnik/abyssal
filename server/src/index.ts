import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { gameConfigRouter } from './game-config';
import { gameManagerRouter, handleGameManagerSocket } from './game-manager';
import { NameGenerator } from './name-generator';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

app.use(express.json());

app.use('/api/game-config', gameConfigRouter);
app.use('/api/game-manager', gameManagerRouter);

// Name generator endpoint
app.get('/api/names', (req, res) => {
  const count = parseInt(req.query.count as string) || 8;
  const names = NameGenerator.generateNames(Math.min(count, 20)); // Cap at 20
  res.json({ names });
});


// Delegate all WebSocket connections to game manager handler
wss.on('connection', (ws) => {
  handleGameManagerSocket(ws);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Abyssal server listening on port ${PORT}`);
});
