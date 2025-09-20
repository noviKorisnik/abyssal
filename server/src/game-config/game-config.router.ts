import { Router } from 'express';
import { defaultGameConfig } from './game-config.defaults';

export const gameConfigRouter = Router();
gameConfigRouter.get('/', (req, res) => {
  res.json(defaultGameConfig);
});
