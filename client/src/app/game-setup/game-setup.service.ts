import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GameSetup } from './game-setup.model';

@Injectable({ providedIn: 'root' })
export class GameSetupService {
  constructor(private http: HttpClient) {}

  sendReady(setup: GameSetup): Observable<{ gameId: string }> {
    // Adjust endpoint as needed
    return this.http.post<{ gameId: string }>(
      '/api/game-manager/assign-player',
      {
        userId: 'some-user-id',
        setup,
      }
    );
  }
}
