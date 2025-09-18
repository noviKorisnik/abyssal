import { Server as SocketIOServer, Socket } from 'socket.io';

export function setupWebSocket(io: SocketIOServer): void {
  io.on('connection', (socket: Socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      console.log(`Client disconnected: ${socket.id}, reason: ${reason}`);
    });

    // Handle ping/pong for connection health
    socket.on('ping', () => {
      socket.emit('pong');
    });

    // Feature-specific event handlers will be added here
    // Example: setupGameEvents(socket, io);
    // Example: setupPlayerEvents(socket, io);
    
    // Error handling
    socket.on('error', (error) => {
      console.error(`Socket error for ${socket.id}:`, error);
    });
  });

  console.log('WebSocket server initialized');
}