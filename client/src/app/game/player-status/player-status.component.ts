import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameStatusMessage } from '../game.model';

export type PlayerStatus = 'in-game' | 'on-turn' | 'done' | 'disconnected';

export interface PlayerStatusInfo {
  userId: string;
  playerName: string;
  status: PlayerStatus;
  colorIndex: number;
}

@Component({
  selector: 'app-player-status',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './player-status.component.html',
  styleUrls: ['./player-status.component.scss']
})
export class PlayerStatusComponent {
  @Input() state!: GameStatusMessage | null;
  @Input() currentUserId!: string;

  get playerStatuses(): PlayerStatusInfo[] {
    if (!this.state?.players) return [];

    return this.state.players.map((player, index) => {
      const isCurrentTurn = this.state?.active?.currentPlayerId === player.userId;
      const isDisconnected = !player.connected;
      const isDone = this.isPlayerDone(player.userId);

      let status: PlayerStatus;
      if (isDisconnected) {
        status = 'disconnected';
      } else if (isDone) {
        status = 'done';
      } else if (isCurrentTurn) {
        status = 'on-turn';
      } else {
        status = 'in-game';
      }

      return {
        userId: player.userId,
        playerName: player.playerName || player.userId,
        status,
        colorIndex: index
      };
    });
  }

  private isPlayerDone(userId: string): boolean {
    // Check if this player has any active ships left
    const playerLayer = this.state?.boardLayout?.playerLayers?.find(
      layer => layer.playerId === userId
    );
    return playerLayer ? !playerLayer.active : false;
  }

  isCurrentPlayer(userId: string): boolean {
    return userId === this.currentUserId;
  }
}
