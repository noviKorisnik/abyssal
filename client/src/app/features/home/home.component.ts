import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="home-container">
      <section class="hero">
        <h1>Welcome to Abyssal</h1>
        <p class="hero-subtitle">Sink Deep, Play Smart</p>
        <p class="hero-description">
          Experience the ultimate multiplayer naval strategy game inspired by Battleship. 
          Battle against human players and AI opponents in epic maritime warfare.
        </p>
        <div class="hero-actions">
          <button class="btn btn-primary" routerLink="/lobby">Join Game</button>
          <button class="btn btn-secondary">Learn to Play</button>
        </div>
      </section>

      <section class="features">
        <h2>Game Features</h2>
        <div class="feature-grid">
          <div class="feature-card">
            <h3>🌊 Epic Naval Battles</h3>
            <p>Command your fleet in strategic turn-based combat</p>
          </div>
          <div class="feature-card">
            <h3>👥 Multiplayer</h3>
            <p>Battle against players from around the world</p>
          </div>
          <div class="feature-card">
            <h3>🤖 AI Opponents</h3>
            <p>Challenge intelligent AI with varying difficulty levels</p>
          </div>
          <div class="feature-card">
            <h3>⚡ Real-time</h3>
            <p>Instant gameplay with WebSocket technology</p>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .home-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .hero {
      text-align: center;
      padding: 3rem 0;
      background: linear-gradient(135deg, rgba(30, 60, 114, 0.1), rgba(42, 82, 152, 0.1));
      border-radius: 12px;
      margin-bottom: 3rem;

      h1 {
        font-size: 3rem;
        margin-bottom: 0.5rem;
        color: #1e3c72;
      }

      .hero-subtitle {
        font-size: 1.3rem;
        color: #2a5298;
        margin-bottom: 1rem;
        font-style: italic;
      }

      .hero-description {
        font-size: 1.1rem;
        color: #6c757d;
        max-width: 600px;
        margin: 0 auto 2rem;
        line-height: 1.6;
      }

      .hero-actions {
        display: flex;
        gap: 1rem;
        justify-content: center;
        flex-wrap: wrap;
      }

      .btn {
        padding: 0.75rem 2rem;
        border: none;
        border-radius: 6px;
        font-size: 1rem;
        cursor: pointer;
        text-decoration: none;
        display: inline-block;
        transition: all 0.3s;

        &.btn-primary {
          background: linear-gradient(135deg, #1e3c72, #2a5298);
          color: white;

          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
          }
        }

        &.btn-secondary {
          background: transparent;
          color: #2a5298;
          border: 2px solid #2a5298;

          &:hover {
            background: #2a5298;
            color: white;
          }
        }
      }
    }

    .features {
      h2 {
        text-align: center;
        font-size: 2.5rem;
        margin-bottom: 2rem;
        color: #1e3c72;
      }

      .feature-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 2rem;
      }

      .feature-card {
        text-align: center;
        padding: 2rem;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        transition: transform 0.3s;

        &:hover {
          transform: translateY(-4px);
        }

        h3 {
          font-size: 1.3rem;
          margin-bottom: 1rem;
          color: #1e3c72;
        }

        p {
          color: #6c757d;
          line-height: 1.6;
        }
      }
    }
  `]
})
export class HomeComponent {}