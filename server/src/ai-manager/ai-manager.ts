import { AIPlayer } from './ai-player';
import { GameSetup } from '../game-model';
import { generateGameSetup } from '../game-setup';
import { GameConfig } from '../game-model';
import { adjectives } from '../name-generator/adjectives';
import { nouns } from '../name-generator/nouns';

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
    
    // Generate AI player name with template "AI ${adjective} ${noun}"
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const playerName = `AI ${adjective} ${noun}`;
    
    return new AIPlayer(userId, setup, playerName);
  }
}
