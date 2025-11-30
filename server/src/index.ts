import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import { gameConfigRouter } from './game-config';
import { gameManagerRouter, handleGameManagerSocket } from './game-manager';
import { NameGenerator } from './name-generator';
import { GameLogger } from './game-manager/game-logger';

// Initialize game logger (creates logs directory if needed)
GameLogger.initialize();

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

if (process.env.NODE_ENV === 'production') {
  // const allowedOrigins = process.env.CLIENT_BASE_URL
  //   ? process.env.CLIENT_BASE_URL.split(',').map(url => url.trim())
  //   : ['http://localhost:4200'];
  const allowedOrigins = process.env.CLIENT_BASE_URL
    ? process.env.CLIENT_BASE_URL
    : 'http://localhost:4200';

  app.use(cors({
    origin: allowedOrigins,
    credentials: true
  }));
}

// Configure CORS

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

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Abyssal server listening on port ${PORT}`);
});
