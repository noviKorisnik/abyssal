import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { StorageService } from './storage.service';

const GAME_ID_KEY = 'abyssal_current_game_id';

/**
 * Service to manage current game ID
 * Stores gameId in storage instead of URL for better UX
 */
@Injectable({
  providedIn: 'root'
})
export class GameStateService {
  private gameIdSubject: BehaviorSubject<string | null>;

  constructor(private storage: StorageService) {
    const storedGameId = this.storage.getItem(GAME_ID_KEY);
    this.gameIdSubject = new BehaviorSubject<string | null>(storedGameId);
  }

  /**
   * Get current game ID as observable
   */
  getGameId$(): Observable<string | null> {
    return this.gameIdSubject.asObservable();
  }

  /**
   * Get current game ID
   */
  getGameId(): string | null {
    return this.gameIdSubject.value;
  }

  /**
   * Set current game ID
   */
  setGameId(gameId: string): void {
    this.storage.setItem(GAME_ID_KEY, gameId);
    this.gameIdSubject.next(gameId);
  }

  /**
   * Clear current game ID (called when game ends)
   */
  clearGameId(): void {
    this.storage.removeItem(GAME_ID_KEY);
    this.gameIdSubject.next(null);
  }

  /**
   * Check if there's an active game
   */
  hasActiveGame(): boolean {
    return this.gameIdSubject.value !== null;
  }
}
