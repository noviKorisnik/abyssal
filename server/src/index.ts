import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

app.get('/', (req, res) => {
  res.send('Abyssal Server is running');
});

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
