import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GameConfig } from './game-config.model';


@Injectable({ providedIn: 'root' })
export class GameConfigService {
  constructor(private http: HttpClient) {}

  getConfig(): Observable<GameConfig> {
    return this.http.get<GameConfig>('/api/game-config');
  }
}
