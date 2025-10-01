import { GamePlayer, GameSetup } from '../game-model';

/**
 * AIPlayer is similar to a regular player, but uses an in-memory socket-like interface.
 */
export class AIPlayer implements GamePlayer {
  userId: string;
  playerName: string;
  setup: GameSetup;
  isAI: boolean = true;
  private listeners: { [event: string]: Function[] } = {};

  constructor(userId: string, setup: GameSetup, playerName: string) {
    this.userId = userId;
    this.playerName = playerName;
    this.setup = setup;
    // console.log(`[AIPlayer] Created AI player with userId=${userId}`);
    // console.log(`[AIPlayer] Setup:`, JSON.stringify(setup, null, 2));
  }

  /**
   * Mimics socket.send for manager communication.
   */
  send(data: any) {
    // AI logic can process game state or commands here
    // For now, just log or ignore
    // console.log(`[AIPlayer ${this.userId}] received:`, data);
  }

  /**
   * Mimics socket.on for event handling.
   */
  on(event: string, handler: Function) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(handler);
  }

  /**
   * Triggers an event (for manager to simulate socket events)
   */
  trigger(event: string, ...args: any[]) {
    if (this.listeners[event]) {
      for (const fn of this.listeners[event]) fn(...args);
    }
  }
}
