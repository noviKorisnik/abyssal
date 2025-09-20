import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { GameConfigService } from './game-config.service';
import { GameConfig } from './game-config.model';

export const gameConfigResolver: ResolveFn<GameConfig> = () => {
  return inject(GameConfigService).getConfig();
};
