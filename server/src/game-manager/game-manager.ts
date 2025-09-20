import { GameConfig } from "../game-config";
import { GamePlayer, GameState } from "../game-setup";

export class GameManager {
    private static instances: GameManager[] = [];

    private _id: string = GameManager.newUid;
    private state: GameState = 'ready';
    private players: GamePlayer[] = [];
    private config: GameConfig;

    private constructor(initialPlayer: GamePlayer) {
        this.config = initialPlayer.setup.config;
        this.addPlayer(initialPlayer);
    }

    static assignPlayerToRoom(player: GamePlayer): GameManager {
        let manager = GameManager.instances.find(
            m => m.assignPlayer(player)
        );
        if (!manager) {
            manager = new GameManager(player);
            GameManager.instances.push(manager);
        }
        return manager;
    }

    private assignPlayer(player: GamePlayer): boolean {
        if (this.state !== 'ready') {
            return false;
        }
        this.addPlayer(player);
        return true;
    }
    private addPlayer(player: GamePlayer) {
        console.log("Adding player to game", this._id, player.userId);
        if (this.players.length === 0) {
            this.config = player.setup.config;
        }
        this.players.push(player);
        if (this.players.length === (this.config?.maxPlayers ?? 4)) {
            this.activateGame();
        }
    }

    private activateGame() {
        this.state = 'active';
        setTimeout(() => {
            // Notify players game is starting
        });
    }


    /**
     * Reset manager for a new game after finishing/cleanup.
     * Assigns new id, clears players, sets state to 'ready'.
     */
    reset(): void {
        this._id = GameManager.newUid;
        this.state = 'ready';
        this.players = [];
        // Remove from array and push to end
        const idx = GameManager.instances.indexOf(this);
        if (idx !== -1) {
            GameManager.instances.splice(idx, 1);
            GameManager.instances.push(this);
        }
        // Optionally reset other state (countdown, etc.)
    }

    private static get newUid(): string {
        const { v4: uuidv4 } = require('uuid');
        return uuidv4();
    }

    get id(): string {
        return this._id;
    }


}
