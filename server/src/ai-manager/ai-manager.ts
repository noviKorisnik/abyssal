import { AIPlayer } from './ai-player';
import { GameSetup } from '../game-model';
import { generateGameSetup } from '../game-setup';
import { GameConfig } from '../game-model';

/**
 * AIManager: Responsible for creating and managing AI players.
 */
export class AIManager {
  private static aiCounter = 0;

  /**
   * Creates a new AI player with a valid random setup.
   */
  static createAIPlayer(config: GameConfig): AIPlayer {
    const userId = `AI_${Date.now()}_${AIManager.aiCounter++}`;
    const setup = generateGameSetup(config);
    return new AIPlayer(userId, setup);
  }
}
