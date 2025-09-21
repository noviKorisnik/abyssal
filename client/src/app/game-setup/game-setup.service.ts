import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { GameSetup } from './game-setup.model';
import { UserService } from '../user';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class GameSetupService {
  private apiUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient, private userService: UserService) {}

  sendReady(setup: GameSetup): Observable<{ gameId: string }> {
    return this.userService.getUserId$().pipe(
      take(1),
      switchMap(userId =>
        this.http.post<{ gameId: string }>(
          `${this.apiUrl}/game-manager/assign-player`,
          {
            userId,
            setup,
          }
        )
      )
    );
  }
}
