import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameStatusMessage, PlayerBoardLayer } from '../game.model';
import { GameSetup } from '../../game-setup/game-setup.model';
import { TimerBarComponent } from '../../shared/timer-bar/timer-bar.component';
import { PlayerStatusComponent } from '../player-status/player-status.component';
import { BoardComponent } from '../../shared/board/board.component';

@Component({
  selector: 'app-game-active',
  standalone: true,
  imports: [CommonModule, TimerBarComponent, PlayerStatusComponent, BoardComponent],
  templateUrl: './game-active.component.html',
  styleUrls: ['./game-active.component.scss']
})
export class GameActiveComponent {
  @Input() state!: GameStatusMessage | null;
  @Input() setup!: { userId: string; setup: GameSetup };
  @Output() pickCell = new EventEmitter<{ x: number; y: number }>();

  private playerSetupCells: Set<string> = new Set();
  
  // Track cells with active explosion animation
  private explodingCells: Set<string> = new Set();
  private lastHistoryLength: number = 0;
  
  // Bound version of getCellClasses for board component
  getCellClassesBound = (x: number, y: number) => this.getCellClasses(x, y);

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

    // Detect new turn and trigger explosion animation
    if (this.state?.history) {
      const currentHistoryLength = this.state.history.length;
      
      if (currentHistoryLength > this.lastHistoryLength) {
        // New turn detected - get the last move
        const lastMove = this.state.history[currentHistoryLength - 1];
        if (lastMove?.cell) {
          const cellKey = `${lastMove.cell.x},${lastMove.cell.y}`;
          this.explodingCells.add(cellKey);
          
          // Remove explosion class after animation completes (1000ms)
          setTimeout(() => {
            this.explodingCells.delete(cellKey);
          }, 1000);
        }
      }
      
      this.lastHistoryLength = currentHistoryLength;
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
      
      // Check for explosion animation
      const cellKey = `${x},${y}`;
      if (this.explodingCells.has(cellKey)) {
        classes.push('cell-exploding');
      }
      
      // Check if this cell is part of player's setup
      const hasPlayerSetup = this.playerSetupCells.has(`${y},${x}`);
      if (hasPlayerSetup) {
        // Find player index
        const players = this.state?.players || [];
        const playerIndex = players.findIndex(p => p.userId === this.setup?.userId);
        
        if (playerIndex !== -1) {
          // Determine setup state: open, hit, or sunk
          const setupState = this.getSetupCellState(x, y);
          classes.push(`cell-setup-player-${playerIndex}-${setupState}`);
        }
      }
      
      // Picked: use baseBoard for played cells
      if (this.board?.[y]?.[x] === 1) {
        classes.push('cell-picked');
      }

      // Both
      if (hasPlayerSetup && classes.includes('cell-picked')) {
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

    getSetupCellState(x: number, y: number): 'open' | 'hit' | 'sunk' {
      // Check if this cell has been hit
      const isHit = this.board?.[y]?.[x] === 1;
      
      if (!isHit) {
        return 'open';
      }
      
      // If hit, check if the entire ship is sunk
      if (this.setup?.setup?.board) {
        // Find the ship this cell belongs to
        const cellData = this.setup.setup.board[y]?.[x];
        if (cellData?.shipId) {
          // Check if all cells of this ship are hit
          const shipCells: {x: number, y: number}[] = [];
          for (let row = 0; row < this.setup.setup.board.length; row++) {
            for (let col = 0; col < this.setup.setup.board[row].length; col++) {
              if (this.setup.setup.board[row][col]?.shipId === cellData.shipId) {
                shipCells.push({x: col, y: row});
              }
            }
          }
          
          // Check if all ship cells are hit in baseBoard
          const allCellsHit = shipCells.every(cell => 
            this.board?.[cell.y]?.[cell.x] === 1
          );
          
          return allCellsHit ? 'sunk' : 'hit';
        }
      }
      
      return 'hit';
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

    get currentPlayerColor(): string {
      if (!this.state?.active?.currentPlayerId) return '#3399ff';
      const players = this.state?.players || [];
      const playerIndex = players.findIndex(p => p.userId === this.state?.active?.currentPlayerId);
      
      // Use the same HSL colors as defined in SCSS
      const colors = [
        'hsl(312, 70%, 50%)', // Red-Orange
        'hsl(24, 70%, 50%)',  // Yellow-Orange  
        'hsl(96, 70%, 50%)',  // Yellow-Green
        'hsl(168, 70%, 50%)'  // Teal
      ];
      
      return colors[playerIndex % colors.length] || '#3399ff';
    }

  get isPlayerTurn(): boolean {
    return !!this.state?.active && this.state.active.currentPlayerId === this.setup?.userId;
  }

  getCurrentPlayerName(): string {
    if (!this.state?.active?.currentPlayerId) return 'Unknown';
    const player = this.state.players?.find(p => p.userId === this.state?.active?.currentPlayerId);
    const playerName = player?.playerName || player?.userId || 'Unknown';
    
    // If timer is at 0, this is the final board showing the winner
    const remainingTime = this.state?.active?.remainingTurnTime || 0;
    if (remainingTime === 0) {
      return `WINNER: ${playerName}`;
    }
    
    return playerName;
  }

  get turnTimeLimitSeconds(): number {
    const timeLimit = this.state?.active?.turnTimeLimit || 15000;
    return Math.floor(timeLimit / 1000);
  }

  get remainingTurnTimeSeconds(): number {
    const remainingTime = this.state?.active?.remainingTurnTime || 0;
    return Math.floor(remainingTime / 1000);
  }
}
