import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-lobby',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="lobby-container">
      <h1>Game Lobby</h1>
      <p>Find and join games here. This feature will be implemented as part of the vertical-slice architecture.</p>
      <div class="placeholder">
        <h3>Coming Soon:</h3>
        <ul>
          <li>Available games list</li>
          <li>Create new game</li>
          <li>Quick match functionality</li>
          <li>Player statistics</li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .lobby-container {
      max-width: 800px;
      margin: 0 auto;
      text-align: center;
    }

    .placeholder {
      background-color: #f8f9fa;
      padding: 2rem;
      border-radius: 8px;
      margin-top: 2rem;

      h3 {
        color: #1e3c72;
        margin-bottom: 1rem;
      }

      ul {
        text-align: left;
        display: inline-block;
        color: #6c757d;
      }
    }
  `]
})
export class LobbyComponent {}