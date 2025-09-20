import { HttpClient } from '@angular/common/http';
import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('client');

  constructor(private http: HttpClient) {}

  callApi() {
    this.http.get('/api/game-config').subscribe({
      next: (response) => console.log('API response:', response),
      error: (err) => console.error('API error:', err)
    });
  }

  openWebSocket() {
  const socket = new WebSocket('/ws');
  socket.onopen = () => {
    console.log('WebSocket connected');
    socket.send('Hello from client!');
  };
  socket.onmessage = (event) => {
    console.log('WebSocket message:', event.data);
  };
  socket.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
  socket.onclose = () => {
    console.log('WebSocket closed');
  };
}
}
