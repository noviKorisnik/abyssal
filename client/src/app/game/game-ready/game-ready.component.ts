import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameStatusMessage } from '../game.model';
import { TimerBarComponent } from '../../shared/timer-bar/timer-bar.component';

@Component({
  selector: 'app-game-ready',
  standalone: true,
  imports: [CommonModule, TimerBarComponent],
  templateUrl: './game-ready.component.html',
  styleUrls: ['./game-ready.component.scss']
})
export class GameReadyComponent {
  @Input() state!: GameStatusMessage | null;
  @Input() currentUserId!: string;
  @Output() quickStart = new EventEmitter<void>();
  @Output() leave = new EventEmitter<void>();

  // Timer state - updated only when state changes to force change detection
  timerState: { total: number; remaining: number } = { total: 0, remaining: 0 };

  ngOnChanges(changes: any) {
    // Update timer state when state changes - creates new object to force change detection
    if (changes['state'] && this.state?.ready) {
      this.timerState = {
        total: this.totalWaitTimeSeconds,
        remaining: this.countdownSeconds
      };
    }
  }

  get countdownSeconds(): number {
    if (!this.state?.ready?.countdownTimer) return 0;
    return Math.floor(this.state.ready.countdownTimer / 1000);
  }

  get totalWaitTimeSeconds(): number {
    if (!this.state?.ready?.waitTime) return 0;
    return Math.floor(this.state.ready.waitTime / 1000);
  }

  isCurrentPlayer(userId: string): boolean {
    return userId === this.currentUserId;
  }

  trackUserId(index: number, player: { userId: string }) {
    return player.userId;
  }
}
