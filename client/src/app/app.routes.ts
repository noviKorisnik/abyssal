import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { 
    path: 'lobby', 
    loadComponent: () => import('./features/lobby/lobby.component').then(m => m.LobbyComponent)
  },
  { 
    path: 'game', 
    loadComponent: () => import('./features/game/game.component').then(m => m.GameComponent)
  },
  { path: '**', redirectTo: '' }
];
