
import { Component, OnInit, OnDestroy } from '@angular/core';
import { GameSocket } from './game.socket';
import { UserService } from '../user';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { GameRoom, GameStatusMessage } from './game.model';

import { CommonModule } from '@angular/common';
import { GameReadyComponent } from './game-ready/game-ready.component';
import { GameActiveComponent } from './game-active/game-active.component';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  imports: [CommonModule, GameReadyComponent, GameActiveComponent],
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
          console.log('[Socket] Message received:', data);
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
  }

  handleSocketMessage(data: any) {
    switch (data.type) {
      case 'state':
        console.log('[Socket] Game state data:', data);
        this.state = data;
        // If in lobby and ready state, start or update countdown
        if (data.phase === 'ready' && data.ready) {
          this.startCountdown(data.ready.countdownTimer);
        } else {
          this.clearCountdownInterval();
        }
        // Redirect to root if state is empty (after leave room)
        if (data.phase === 'done' || (data.players && data.players.length === 0)) {
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
}
