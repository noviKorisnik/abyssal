import { connect } from "http2";
import { GameConfig } from "../game-config";
import { GamePlayer, GameState } from "../game-setup";

export class GameManager {
    // Track sockets for each game manager (room)
    private sockets: Set<any> = new Set(); // Use 'any' for WebSocket type compatibility
    private static instances: GameManager[] = [];
    static byId: Map<string, GameManager> = new Map();

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
            GameManager.byId.set(manager.id, manager);
        }
        return manager;
    }

    addSocket(socket: any, userId: string) {
        socket.userId = userId;//this was suggested while I was typing... neat if can work
        const player = this.players.find(p => p.userId === userId);
        if (!player) {
            socket.send(JSON.stringify({ type: 'error', error: 'Player not in game' }));
            return;
        }
        socket.player = player;// attach player info to socket, also good if can work
        this.sockets.add(socket);
        socket.on('message', (data: any) => {
            // Handle player message for this room/game
            // e.g., parse action, update state, broadcast, etc.
        });
        socket.on('close', () => {
            this.removeSocket(socket);
            // Optionally: handle player disconnect logic here
            // e.g., update game state, notify other players
        });
        socket.send(JSON.stringify({ type: 'joined', gameId: this.id, player }));
        this.broadcast({ type: 'lobby', players: this.playerList() });
    }

    removeSocket(socket: any) {
        this.sockets.delete(socket);
        this.broadcast({ type: 'lobby', players: this.playerList() });
    }

    // Broadcast a message to all sockets in this room
    broadcast(message: any) {
        const msg = typeof message === 'string' ? message : JSON.stringify(message);
        for (const sock of this.sockets) {
            try {
                sock.send(msg);
            } catch (err) {
                // Optionally handle broken sockets
            }
        }
    }

    private playerList() {
        return this.players.map(p => ({
            userId: p.userId,
            connected: Array.from(this.sockets).some(sock => sock.userId === p.userId)
        }));
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
        // Remove old id from map
        GameManager.byId.delete(this._id);
        this._id = GameManager.newUid;
        this.state = 'ready';
        this.players = [];
        // Add new id to map
        GameManager.byId.set(this._id, this);
        // Remove from array and push to end
        const idx = GameManager.instances.indexOf(this);
        if (idx !== -1) {
            GameManager.instances.splice(idx, 1);
            GameManager.instances.push(this);
        }
        // Optionally reset other state (countdown, etc.)
        this.sockets.clear();
    }

    private static get newUid(): string {
        const { v4: uuidv4 } = require('uuid');
        return uuidv4();
    }

    get id(): string {
        return this._id;
    }

    static getById(id: string): GameManager | undefined {
        return GameManager.byId.get(id);
    }
}
