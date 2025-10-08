
import { Component, OnInit, OnDestroy } from '@angular/core';
import { GameSocket } from './game.socket';
import { UserService } from '../user';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { GameRoom, GameStatusMessage } from './game.model';

import { CommonModule } from '@angular/common';
import { GameReadyComponent } from './game-ready/game-ready.component';
import { GameActiveComponent } from './game-active/game-active.component';
import { GameDoneComponent } from './game-done/game-done.component';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  imports: [CommonModule, GameReadyComponent, GameActiveComponent, GameDoneComponent],
  styleUrls: ['./game.component.scss'],
  // imports: [CommonModule]
})
export class GameComponent implements OnInit, OnDestroy {
  onPickCell(cell: { x: number; y: number }) {
    if (this.socket && this.state?.phase === 'active') {
      this.socket.send({ type: 'pickCell', gameId: this.gameId, userId: this.userId, cell });
    }
  }
  trackUserId(index: number, player: { userId: string }) {
    return player.userId;
  }
  gameId: string = '';
  userId: string = '';
  socket: GameSocket | null = null;
  room: GameRoom | null = null;
  state: GameStatusMessage | null = null;
  gameState: any = null;
  connected: boolean = false;
  countdown: number = 0;
  private countdownInterval: any = null;
  private userIdSub: Subscription | null = null;
  
  // Track if we're showing the final board before transitioning to done screen
  showingFinalBoard: boolean = false;
  private finalBoardTimeout: any = null;

  constructor(private userService: UserService, private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    // Get gameId from route param
    this.gameId = this.route.snapshot.paramMap.get('gameId') || 'demo-game-id';
    // Subscribe to userId observable
    this.userIdSub = this.userService.getUserId$().subscribe(userId => {
      this.userId = userId;
      if (this.socket) {
        this.socket.close();
      }
      this.socket = new GameSocket(this.gameId, this.userId);
      this.socket.connect(
        (data) => {
          // console.log('[Socket] Message received:', data);
          this.handleSocketMessage(data);
        },
        () => {
          this.connected = true;
          console.log(`[Socket] Connected: gameId=${this.gameId}, userId=${this.userId}`);
        },
        () => {
          this.connected = false;
          console.log('[Socket] Disconnected');
        }
      );
    });
  }

  ngOnDestroy() {
    if (this.socket) {
      console.log('[Socket] Closing connection');
      this.socket.close();
    }
    if (this.userIdSub) {
      this.userIdSub.unsubscribe();
    }
    this.clearCountdownInterval();
    this.clearFinalBoardTimeout();
  }

  handleSocketMessage(data: any) {
    switch (data.type) {
      case 'state':
        // Log turn details for debugging
        this.logTurnDetails(data);
        
        // Handle transition to done phase with delay
        if (data.phase === 'done' && !this.showingFinalBoard && this.state?.phase === 'active') {
          // Game just ended - update state to show final board, but delay showing rankings
          console.log('=== GAME OVER ===');
          console.log('Final Rankings:', data.done?.placements?.map((p: any) => {
            const player = data.players.find((pl: any) => pl.userId === p.userId);
            const name = player?.playerName || player?.userId || p.userId;
            const elimTurn = player?.eliminatedAtTurn ? ` (eliminated turn ${player.eliminatedAtTurn})` : ' (winner)';
            return `${p.rank}. ${name}${elimTurn}`;
          }).join(' | '));
          console.log('================');
          
          this.state = data; // Update state immediately to show final board
          this.showingFinalBoard = true;
          this.clearFinalBoardTimeout();
          this.finalBoardTimeout = setTimeout(() => {
            this.showingFinalBoard = false;
            // State already updated, just stop showing active component
          }, 3000); // 3 second delay
          return;
        }
        
        this.state = data;
        // If in lobby and ready state, start or update countdown
        if (data.phase === 'ready' && data.ready) {
          this.startCountdown(data.ready.countdownTimer);
        } else {
          this.clearCountdownInterval();
        }
        // Redirect to root if state is empty (after leave room)
        // But do NOT redirect on done phase - let user view results
        if (data.phase === 'done') {
          // Server may reset game, but client stays on done screen
          // User manually navigates via buttons
          return;
        }
        if (data.players && data.players.length === 0) {
          this.router.navigate(['/']);
        }
        break;
      case 'joined':
        console.log('[Socket] Joined confirmation:', data);
        this.room = { gameId: data.gameId, player: data.player };
        break;
      case 'error':
        console.error('[Socket] Error:', data.error);
        // Optionally show error to user
        break;
      case 'kicked':
        console.warn('[Socket] You were removed from the game:', data.reason);
        // Optionally show notification to user
        this.router.navigate(['/']);
        break;
      default:
        // Handle other message types as needed
        console.log('[Socket] Unhandled message type:', data);
        break;
    }
  }

  startCountdown(ms: number) {
    this.countdown = Math.max(0, Math.floor(ms / 1000));
    this.clearCountdownInterval();
    if (this.countdown > 0) {
      this.countdownInterval = setInterval(() => {
        if (this.countdown > 0) {
          this.countdown--;
        } else {
          this.clearCountdownInterval();
        }
      }, 1000);
    }
  }

  clearCountdownInterval() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
  }

  clearFinalBoardTimeout() {
    if (this.finalBoardTimeout) {
      clearTimeout(this.finalBoardTimeout);
      this.finalBoardTimeout = null;
    }
  }

  logTurnDetails(data: any) {
    // Only log for active or done phases with history
    if (!data.history || data.history.length === 0) return;
    
    // Check if this is a new turn (history length changed)
    const currentHistoryLength = this.state?.history?.length || 0;
    if (data.history.length <= currentHistoryLength) return;
    
    // Get the latest turn
    const latestTurn = data.history[data.history.length - 1];
    const turnNo = data.history.length;
    
    // Find player name
    const player = data.players.find((p: any) => p.userId === latestTurn.playerId);
    const playerName = player?.playerName || player?.userId || 'Unknown';
    
    // Format hits
    const hits = latestTurn.hits.map((pid: string) => {
      const p = data.players.find((pl: any) => pl.userId === pid);
      return p?.playerName || p?.userId || pid;
    });
    
    // Format sinks with ship info
    const sinks = latestTurn.sinks.map((pid: string) => {
      const p = data.players.find((pl: any) => pl.userId === pid);
      const playerLabel = p?.playerName || p?.userId || pid;
      
      // Find the sunk ship cells for this player
      const layer = data.boardLayout?.playerLayers.find((l: any) => l.playerId === pid);
      if (layer && layer.sunkShips) {
        const sunkShip = layer.sunkShips.find((ship: any) => 
          ship.cells.some((c: any) => c.x === latestTurn.cell.x && c.y === latestTurn.cell.y)
        );
        if (sunkShip) {
          const cellsStr = sunkShip.cells.map((c: any) => `(${c.x},${c.y})`).join(', ');
          return `${playerLabel} [${cellsStr}]`;
        }
      }
      return playerLabel;
    });
    
    // Find eliminated players (newly eliminated in this turn)
    const eliminated = data.players
      .filter((p: any) => p.eliminatedAtTurn === turnNo)
      .map((p: any) => p.playerName || p.userId);
    
    // Build log message
    const parts = [
      `Turn #${turnNo}`,
      `Player: ${playerName}`,
      `Picked: (${latestTurn.cell.x},${latestTurn.cell.y})`
    ];
    
    if (hits.length > 0) {
      parts.push(`Hits: [${hits.join(', ')}]`);
    }
    
    if (sinks.length > 0) {
      parts.push(`Sunk: [${sinks.join(', ')}]`);
    }
    
    if (eliminated.length > 0) {
      parts.push(`Eliminated: [${eliminated.join(', ')}]`);
    }
    
    console.log(parts.join(' | '));
  }

  onQuickStart() {
    if (this.socket && this.state?.ready?.quickStartEnabled) {
      this.socket.send({ type: 'quickStart', gameId: this.gameId, userId: this.userId });
    }
  }

  onLeaveRoom() {
    if (this.socket) {
      this.socket.send({ type: 'exit', gameId: this.gameId, userId: this.userId });
    }
  }

  onNewGame() {
    this.router.navigate(['/game-setup']);
  }

  onGoHome() {
    this.router.navigate(['/']);
  }
}
