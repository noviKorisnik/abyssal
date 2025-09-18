import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="game-container">
      <h1>Game Board</h1>
      <p>Active gameplay interface. This feature will be implemented as part of the vertical-slice architecture.</p>
      <div class="placeholder">
        <h3>Coming Soon:</h3>
        <ul>
          <li>Interactive game board</li>
          <li>Real-time move updates</li>
          <li>Turn-based gameplay</li>
          <li>Game chat</li>
          <li>Ship placement</li>
          <li>Battle results</li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .game-container {
      max-width: 1000px;
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
export class GameComponent {}