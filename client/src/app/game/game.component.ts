import { Component, OnInit, OnDestroy } from '@angular/core';
import { GameSocket } from './game.socket';
import { UserService } from '../user';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit, OnDestroy {
  gameId: string = '';
  userId: string = '';
  socket: GameSocket | null = null;
  lobby: any = null;
  gameState: any = null;
  connected: boolean = false;
  private userIdSub: Subscription | null = null;

  constructor(private userService: UserService, private route: ActivatedRoute) {}

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
  }

  handleSocketMessage(data: any) {
    if (data.type === 'lobby') {
      console.log('[Socket] Lobby data:', data);
      this.lobby = data;
    } else if (data.type === 'gameState') {
      console.log('[Socket] Game state data:', data);
      this.gameState = data;
    }
    // handle other message types as needed
  }
}
