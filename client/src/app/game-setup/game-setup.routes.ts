import { Routes } from '@angular/router';
import { GameSetupComponent } from './game-setup.component';
import { gameConfigResolver } from './game-config.resolver';

export const gameSetupRoutes: Routes = [
  {
    path: '',
    component: GameSetupComponent,
    resolve: {
      gameConfig: gameConfigResolver
    }
  }
];
