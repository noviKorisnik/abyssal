import { Routes } from '@angular/router';

export const routes: Routes = [
	{
		path: '',
		loadChildren: () => import('./home').then(m => m.homeRoutes)
	},
	{
		path: 'game-setup',
		loadChildren: () => import('./game-setup').then(m => m.gameSetupRoutes)
	},
	{
		path: 'game',
		loadChildren: () => import('./game').then(m => m.gameRoutes)
	}
];
