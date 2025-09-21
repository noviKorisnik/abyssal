import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GameConfig } from './game-config.model';
import { environment } from '../../environments/environment';


@Injectable({ providedIn: 'root' })
export class GameConfigService {
  private apiUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) { }

  getConfig(): Observable<GameConfig> {
    return this.http.get<GameConfig>(`${this.apiUrl}/game-config`);
  }
}
