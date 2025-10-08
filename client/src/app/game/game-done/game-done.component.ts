import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameStatusMessage } from '../game.model';

@Component({
  selector: 'app-game-done',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game-done.component.html',
  styleUrls: ['./game-done.component.scss']
})
export class GameDoneComponent {
  @Input() state!: GameStatusMessage | null;
  @Input() currentUserId!: string;
  @Output() newGame = new EventEmitter<void>();
  @Output() home = new EventEmitter<void>();

  get winnerId(): string {
    return this.state?.done?.winnerId || '';
  }

  get isWinner(): boolean {
    return this.winnerId === this.currentUserId;
  }

  get winnerName(): string {
    const winner = this.state?.players.find(p => p.userId === this.winnerId);
    return winner?.playerName || winner?.userId || 'Unknown';
  }

  get currentPlayerRank(): number {
    const placement = this.state?.done?.placements.find(p => p.userId === this.currentUserId);
    return placement?.rank || 0;
  }

  get sortedPlacements() {
    if (!this.state?.done?.placements) return [];
    
    return this.state.done.placements
      .slice()
      .sort((a, b) => a.rank - b.rank)
      .map(p => {
        const player = this.state?.players.find(pl => pl.userId === p.userId);
        return {
          userId: p.userId,
          playerName: player?.playerName || player?.userId || 'Unknown',
          rank: p.rank,
          isCurrentUser: p.userId === this.currentUserId
        };
      });
  }

  getRankSuffix(rank: number): string {
    if (rank === 1) return 'st';
    if (rank === 2) return 'nd';
    if (rank === 3) return 'rd';
    return 'th';
  }

  getRankEmoji(rank: number): string {
    if (rank === 1) return '🏆';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return '💀';
  }
}
