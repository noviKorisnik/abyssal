import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { gameConfigRouter } from './game-config';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

// app.get('/', (req, res) => {
//   console.log('Received request for root', req.headers);
//   res.send('Abyssal Server is running');
// });
// app.get('/api', (req, res) => {
//   console.log('Received request for API', req.headers);
//   res.json({ message: 'Abyssal API is running' });
// });


app.use('/api/game-config', gameConfigRouter);


wss.on('connection', (ws) => {
  ws.send('Welcome to Abyssal WebSocket server!');
  ws.on('message', (message) => {
    // Handle incoming WebSocket messages
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Abyssal server listening on port ${PORT}`);
});
