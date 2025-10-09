import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { StorageService } from './storage.service';

const PLAYER_NAME_KEY = 'abyssal_player_name';

@Injectable({
  providedIn: 'root'
})
export class PlayerNameService {
  private apiUrl = '/api/names'; // Use relative URL for proxy

  constructor(
    private http: HttpClient,
    private storage: StorageService
  ) {}

  /**
   * Get player name from storage
   */
  getStoredPlayerName(): string | null {
    return this.storage.getItem(PLAYER_NAME_KEY);
  }

  /**
   * Save player name to storage
   */
  savePlayerName(name: string): void {
    this.storage.setItem(PLAYER_NAME_KEY, name);
  }

  /**
   * Clear stored player name
   */
  clearPlayerName(): void {
    this.storage.removeItem(PLAYER_NAME_KEY);
  }

  /**
   * Fetch list of random generated names from server
   */
  fetchNameSuggestions(count: number = 8): Observable<string[]> {
    // Add timestamp to prevent caching
    const timestamp = new Date().getTime();
    return this.http.get<{ names: string[] }>(`${this.apiUrl}?count=${count}&_t=${timestamp}`)
      .pipe(
        map(response => response.names),
        catchError(error => {
          console.error('Failed to fetch name suggestions:', error);
          // Return fallback names if API fails
          return of([
            'Swift Warrior',
            'Bold Knight',
            'Clever Mage',
            'Silent Hunter',
            'Brave Dragon',
            'Mystic Phoenix',
            'Shadow Wolf',
            'Thunder Eagle'
          ]);
        })
      );
  }
}
