import { Component, Input, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-timer-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './timer-bar.component.html',
  styleUrls: ['./timer-bar.component.scss']
})
export class TimerBarComponent implements OnChanges, OnDestroy {
  @Input() timerState?: { total: number; remaining: number }; // Timer state object (forces change detection)
  @Input() color: string = '#3399ff'; // Color for the progress bar
  @Input() label: string = 'Time Left'; // Label for the timer
  @Input() isUserTurn: boolean = false; // Whether it's the current user's turn

  currentTime: number = 0;
  private totalTimeCached: number = 0; // Cache total time for progress calculation
  private countdownInterval: any = null;
  private countdownStartTime: number = 0;
  private initialTime: number = 0;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['timerState'] && this.timerState) {
      const roundedTime = Math.floor(this.timerState.remaining);
      this.totalTimeCached = this.timerState.total;
      this.startCountdown(roundedTime);
    }
  }

  ngOnDestroy() {
    this.clearCountdownInterval();
  }

  startCountdown(seconds: number) {
    const roundedSeconds = Math.floor(Math.max(0, seconds));
    this.currentTime = roundedSeconds;
    this.initialTime = roundedSeconds;
    this.countdownStartTime = Date.now();
    this.clearCountdownInterval();
    
    if (this.currentTime > 0) {
      this.countdownInterval = setInterval(() => {
        const elapsed = (Date.now() - this.countdownStartTime) / 1000;
        this.currentTime = Math.max(0, this.initialTime - elapsed);
        
        if (this.currentTime <= 0) {
          this.currentTime = 0;
          this.clearCountdownInterval();
        }
      }, 20);
    }
  }

  clearCountdownInterval() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
  }

  get progressPercentage(): number {
    if (this.totalTimeCached <= 0) return 0;
    // Progress from 0% to 100% as time elapses (left to right)
    const elapsed = this.totalTimeCached - this.currentTime;
    return 100 - Math.max(0, Math.min(100, (elapsed / this.totalTimeCached) * 100));
  }

  get timeDisplay(): string {
    return `${Math.floor(this.currentTime)}`;
  }
}