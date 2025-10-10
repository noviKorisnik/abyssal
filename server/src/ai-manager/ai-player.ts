import { GamePlayer, GameSetup } from '../game-model';

/**
 * AIPlayer is similar to a regular player, but uses an in-memory socket-like interface.
 * Implements a simple "random AI provider" that makes valid moves with realistic timing.
 */
export class AIPlayer implements GamePlayer {
  userId: string;
  playerName: string;
  setup: GameSetup;
  isAI: boolean = true;
  private listeners: { [event: string]: Function[] } = {};
  private gameManagerCallback?: (message: any) => void;
  private moveTimeout?: NodeJS.Timeout;

  constructor(userId: string, setup: GameSetup, playerName: string) {
    this.userId = userId;
    this.playerName = playerName;
    this.setup = setup;
  }

  /**
   * Set the callback to send messages to game manager
   */
  setGameManagerCallback(callback: (message: any) => void) {
    this.gameManagerCallback = callback;
  }

  /**
   * Mimics socket.send for manager communication.
   * AI processes game state and makes moves when it's their turn.
   */
  send(data: any) {
    // Clear any pending move timeout
    if (this.moveTimeout) {
      clearTimeout(this.moveTimeout);
      this.moveTimeout = undefined;
    }

    // Parse the message if it's a string
    const message = typeof data === 'string' ? JSON.parse(data) : data;

    // Check if it's a game state update
    if (message.type === 'state' && message.phase === 'active') {
      // Check if it's AI's turn
      if (message.active?.currentPlayerId === this.userId) {
        // AI needs to make a move!
        this.scheduleMove(message);
      }
    }
  }

  /**
   * Schedule a move after a random delay (1-5 seconds)
   */
  private scheduleMove(gameState: any) {
    // Random delay between 1000ms (1s) and 5000ms (5s)
    const delay = Math.floor(Math.random() * 4000) + 1000;

    console.log(`[AIPlayer ${this.playerName}] Thinking... (${delay}ms)`);

    this.moveTimeout = setTimeout(() => {
      this.makeMove(gameState);
    }, delay);
  }

  /**
   * Make a random valid move
   */
  private makeMove(gameState: any) {
    // Get board dimensions from state
    const boardLayout = gameState.boardLayout;
    if (!boardLayout || !boardLayout.baseBoard) {
      console.warn(`[AIPlayer ${this.playerName}] No board layout in state`);
      return;
    }

    const baseBoard = boardLayout.baseBoard;
    const rows = baseBoard.length;
    const cols = baseBoard[0]?.length || 0;

    // Find all available (unplayed) cells
    const availableCells: Array<{ x: number; y: number }> = [];
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        if (baseBoard[y][x] === 0) {
          availableCells.push({ x, y });
        }
      }
    }

    if (availableCells.length === 0) {
      console.warn(`[AIPlayer ${this.playerName}] No available cells to play`);
      return;
    }

    // Pick a random cell
    const randomIndex = Math.floor(Math.random() * availableCells.length);
    const cell = availableCells[randomIndex];

    console.log(`[AIPlayer ${this.playerName}] Playing cell (${cell.x}, ${cell.y})`);

    // Send pickCell message to game manager
    if (this.gameManagerCallback) {
      this.gameManagerCallback({
        type: 'pickCell',
        gameId: gameState.gameId,
        userId: this.userId,
        cell
      });
    }
  }

  /**
   * Cleanup on player removal
   */
  cleanup() {
    if (this.moveTimeout) {
      clearTimeout(this.moveTimeout);
      this.moveTimeout = undefined;
    }
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
