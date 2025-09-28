import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameStatusMessage } from '../game.model';

@Component({
  selector: 'app-game-ready',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game-ready.component.html',
  styleUrls: ['./game-ready.component.scss']
})
export class GameReadyComponent implements OnChanges, OnDestroy {
  @Input() state!: GameStatusMessage | null;
  @Output() quickStart = new EventEmitter<void>();
  @Output() leave = new EventEmitter<void>();

  countdown: number = 0;
  private countdownInterval: any = null;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['state'] && this.state?.ready) {
      this.startCountdown(this.state.ready.countdownTimer);
    } else {
      this.clearCountdownInterval();
    }
  }

  ngOnDestroy() {
    this.clearCountdownInterval();
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

  trackUserId(index: number, player: { userId: string }) {
    return player.userId;
  }
}
