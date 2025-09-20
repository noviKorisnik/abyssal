import { Routes } from '@angular/router';
import { GameComponent } from './game.component';

export const gameRoutes: Routes = [
  {
    path: ':gameId',
    component: GameComponent,
  },
];
