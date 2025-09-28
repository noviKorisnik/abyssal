import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameStatusMessage, PlayerBoardLayer } from '../game.model';
import { GameSetup } from '../../game-setup/game-setup.model';

@Component({
  selector: 'app-game-active',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game-active.component.html',
  styleUrls: ['./game-active.component.scss']
})
export class GameActiveComponent {
  @Input() state!: GameStatusMessage | null;
  @Input() setup!: { userId: string; setup: GameSetup };
  @Output() pickCell = new EventEmitter<{ x: number; y: number }>();

  turnCountdown: number = 0;
  private turnCountdownInterval: any = null;

  private playerSetupCells: Set<string> = new Set();

  ngOnChanges(changes: any) {
    // Map setup cells for fast lookup
    this.playerSetupCells.clear();
    if (this.setup?.setup?.board) {
      for (const row of this.setup.setup.board) {
        for (const cell of row) {
          if (cell.shipId) {
            this.playerSetupCells.add(`${cell.row},${cell.col}`);
          }
        }
      }
    }
    // Handle countdown logic
    if (changes['state'] && this.state?.active) {
      this.startTurnCountdown(this.state.active.remainingTurnTime);
    } else {
      this.clearTurnCountdownInterval();
    }
  }

    // Board and player layers helpers
    get board(): number[][] {
      return this.state?.boardLayout?.baseBoard || [];
    }

    get playerLayers(): PlayerBoardLayer[] {
      return this.state?.boardLayout?.playerLayers || [];
    }

    getCellClasses(x: number, y: number): string[] {
      const classes = ['cell'];
      // Player setup: use mapped Set for fast lookup
      if (this.playerSetupCells.has(`${y},${x}`)) {
        classes.push('cell-player');
      }
      // Picked: use baseBoard for played cells
      if (this.board?.[y]?.[x] === 1) {
        classes.push('cell-picked');
      }

      // Both
      if (classes.includes('cell-player') && classes.includes('cell-picked')) {
        classes.push('cell-player-picked');
      }

      // Add .active if player's turn and cell is not picked
      if (this.isPlayerTurn && !classes.includes('cell-picked')) {
        classes.push('active');
      }

      // Add hit/sunk classes for each player
      this.playerLayers.forEach((layer, idx) => {
        if (layer.revealedBoard[y]?.[x] === 1) {
          // Check if part of sunk ship
          let sunk = false;
          for (const ship of layer.sunkShips) {
            if (ship.cells.some((c: { x: number; y: number }) => c.x === x && c.y === y)) {
              sunk = true;
              break;
            }
          }
          if (sunk) {
            classes.push(`cell-player-${idx}-sunk`);
          } else {
            classes.push(`cell-player-${idx}-hit`);
          }
        }
      });

      return classes;
    }

    getCellHits(x: number, y: number): Array<{ playerId: string; sunk: boolean }>{
      const hits: Array<{ playerId: string; sunk: boolean }> = [];
      for (const layer of this.playerLayers) {
        if (layer.revealedBoard[y]?.[x] === 1) {
          // Check if part of sunk ship
          let sunk = false;
          for (const ship of layer.sunkShips) {
            if (ship.cells.some((c: { x: number; y: number }) => c.x === x && c.y === y)) {
              sunk = true;
              break;
            }
          }
          hits.push({ playerId: layer.playerId, sunk });
        }
      }
      return hits;
    }

    getPlayerColorClass(playerId: string): string {
      const idx = this.playerLayers.findIndex(l => l.playerId === playerId);
      return `player-${idx}`;
    }
  // (removed duplicate ngOnChanges)

  ngOnDestroy() {
    this.clearTurnCountdownInterval();
  }

  startTurnCountdown(ms: number) {
    this.turnCountdown = Math.max(0, Math.ceil(ms / 1000));
    this.clearTurnCountdownInterval();
    if (this.turnCountdown > 0) {
      this.turnCountdownInterval = setInterval(() => {
        if (this.turnCountdown > 0) {
          this.turnCountdown--;
        } else {
          this.clearTurnCountdownInterval();
        }
      }, 1000);
    }
  }

  clearTurnCountdownInterval() {
    if (this.turnCountdownInterval) {
      clearInterval(this.turnCountdownInterval);
      this.turnCountdownInterval = null;
    }
  }

  get isPlayerTurn(): boolean {
    return !!this.state?.active && this.state.active.currentPlayerId === this.setup?.userId;
  }
}
