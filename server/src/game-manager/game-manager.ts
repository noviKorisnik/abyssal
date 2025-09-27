import { GameConfig } from "../game-config";
import { GamePlayer, GameState, GameStatusMessage } from "../game-model";
import { AIManager } from '../ai-manager';

export class GameManager {
    // Track sockets for each game manager (room)
    private sockets: Set<any> = new Set(); // Use 'any' for WebSocket type compatibility
    private static instances: GameManager[] = [];
    static byId: Map<string, GameManager> = new Map();

    private _id: string = GameManager.newUid;
    private state: GameState = 'ready';
    private players: GamePlayer[] = [];
    private config!: GameConfig;

    private lobbyStartTimestamp: number | null = null;
    private lobbyTimeout: NodeJS.Timeout | null = null;

    // --- Turn management ---
    private turnOrder: string[] = [];
    private currentTurnIndex: number = 0;
    private turnStartTimestamp: number | null = null;
    private turnTimeout: NodeJS.Timeout | null = null;

    private constructor(initialPlayer?: GamePlayer) {
        if (initialPlayer) {
            this.config = initialPlayer.setup.config;
            this.addPlayer(initialPlayer);
        }
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

    static processMessage(socket: any, data: any) {
        if (!data || !data.type) {
            socket.send(JSON.stringify({ type: 'error', error: 'Invalid message format' }));
            return;
        }
        if (data.type === 'join') {
            GameManager.processJoin(socket, data);
            return;
        }
        if (!data.gameId) {
            socket.send(JSON.stringify({ type: 'error', error: 'Missing gameId for action' }));
            return;
        }
        const manager = GameManager.getById(data.gameId);
        if (!manager) {
            socket.send(JSON.stringify({ type: 'error', error: 'Game not found' }));
            return;
        }
        manager.dispatch(data);
    }


    /**
     * Static public entry point for handling a join request from a WebSocket.
     * Finds manager, validates, attaches socket, and broadcasts state.
     */
    private static processJoin(socket: any, data: any) {
        if (!data || !data.userId || !data.gameId) {
            socket.send(JSON.stringify({ type: 'error', error: 'Missing userId or gameId' }));
            return;
        }
        const manager = GameManager.getById(data.gameId);
        if (!manager) {
            socket.send(JSON.stringify({ type: 'error', error: 'Game not found' }));
            return;
        }
        if (data.gameId !== manager.id) {
            socket.send(JSON.stringify({ type: 'error', error: 'Game ID mismatch' }));
            return;
        }
        const player = manager.players.find((p: GamePlayer) => p.userId === data.userId);
        if (!player) {
            socket.send(JSON.stringify({ type: 'error', error: 'Player not in game' }));
            return;
        }
        socket.gameId = data.gameId;
        socket.userId = data.userId;
        socket.player = player;
        manager.sockets.add(socket);
        socket.on('close', () => {
            manager.removeSocket(socket);
            // Optionally: handle player disconnect logic here
        });
        socket.send(JSON.stringify({ type: 'joined', gameId: manager.id, player }));
        manager.broadcast();
    }

    private static getById(id: string): GameManager | undefined {
        return GameManager.byId.get(id);
    }

    private static get newUid(): string {
        const { v4: uuidv4 } = require('uuid');
        return uuidv4();
    }

    get id(): string {
        return this._id;
    }

    private dispatch(msg: any) {
        switch (msg.type) {
            case 'quickStart':
                this.handleQuickStart(msg.userId);
                break;
            case 'exit':
                this.handleExit(msg.userId);
                break;
            case 'pickCell':
                this.handlePickCell(msg.userId, msg.cell);
                break;
            default:
                console.warn(`Unhandled message type: ${msg.type}`);
        }
    }

    // Handle player picking a cell
    private handlePickCell(userId: string, cell: { x: number; y: number }) {
        // TODO: Validate turn, process move, update game state, advance turn
        console.log(`Player ${userId} picked cell (${cell.x},${cell.y})`);
        // Implement game logic here
        // After processing, call nextTurn() if move is valid
        // this.nextTurn();
    }

    private removeSocket(socket: any) {
        this.sockets.delete(socket);
        this.broadcast();
    }

    private handleQuickStart(userId: string) {
        if (this.quickStartEnabled) {
            this.activateGame();
        }
    }

    private handleExit(userId: string) {
        if (this.state !== 'ready') return;
        this.players = this.players.filter(p => p.userId !== userId);
        for (const sock of Array.from(this.sockets)) {
            if (sock.userId === userId) {
                try {
                    sock.send(JSON.stringify({ type: 'kicked', reason: 'left' }));
                } catch {}
                this.sockets.delete(sock);
            }
        }
        if (this.players.length === 0) {
            this.reset();
        } else {
            this.broadcast();
        }
    }

    private broadcast() {
        const message: GameStatusMessage = {
            type: 'state',
            phase: this.state,
            gameId: this.id,
            players: this.playerList(),
            ready: this.readyState,
            active: this.activeState,
            done: this.doneState,
            history: this.historyState,
            boardLayout: this.boardLayoutState,
        };
        const msg = JSON.stringify(message);
        for (const sock of this.sockets) {
            try { sock.send(msg); } catch (err) { /* handle error */ }
        }
    }

    private get activeState() {
        if (this.state !== 'active') return undefined;
        return {
            currentPlayerId: this.currentPlayerId,
            turnTimeLimit: this.turnTimeLimit,
            remainingTurnTime: this.remainingTurnTime,
        };
    }

    private get doneState() {
        if (this.state !== 'done') return undefined;
        // Stub: implement when game ends
        return undefined;
    }

    private get historyState() {
        if (!['active', 'done'].includes(this.state)) return undefined;
        // Stub: implement game history tracking
        return undefined;
    }

    private get boardLayoutState() {
        if (!['active', 'done'].includes(this.state)) return undefined;
        // Stub: implement board layout tracking
        return undefined;
    }

    private get waitTime() {
        return (this.config.lobbyWaitSeconds ?? 60) * 1000;
    }
    private get countdownTimer() {
        if (this.lobbyStartTimestamp) {
            return Math.max(0, this.waitTime - (Date.now() - this.lobbyStartTimestamp));
        }
        return 0;
    }
    private get quickStartEnabled() {
        if (this.state !== 'ready') return false;
        return this.players.length >= (this.config.minPlayers ?? 2) && this.countdownTimer <= this.waitTime / 2;// could be also another config parameter
    }
    private get readyState() {
        if (this.state !== 'ready') return undefined;
        return {
            waitTime: this.waitTime,
            countdownTimer: this.countdownTimer,
            quickStartEnabled: this.quickStartEnabled,
        };
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
            this.config = JSON.parse(JSON.stringify(player.setup.config));
            this.lobbyStartTimestamp = Date.now();
            if (this.lobbyTimeout) {
                clearTimeout(this.lobbyTimeout);
            }
            this.lobbyTimeout = setTimeout(() => {
                if (this.state === 'ready') {
                    this.activateGame();
                }
            }, (this.waitTime));

            // Add half-time broadcast
            setTimeout(() => {
                if (this.quickStartEnabled) {
                    this.broadcast();
                }
            }, this.waitTime / 2);
        }
        this.players.push(player);
        if (this.players.length === (this.config?.maxPlayers ?? 4)) {
            this.activateGame();
        }
    }

    private activateGame() {
        // Inject AI players if not enough real players
        if (this.players.length < (this.config.minPlayers ?? 2)) {
            this.injectAIPlayers((this.config.minPlayers ?? 2) - this.players.length);
        }
        this.state = 'active';
        if (this.lobbyTimeout) {
            clearTimeout(this.lobbyTimeout);
            this.lobbyTimeout = null;
        }
        // Keep lobby order, randomize initial player
        this.turnOrder = this.players.map(p => p.userId);
        this.currentTurnIndex = Math.floor(Math.random() * this.turnOrder.length);
        this.startTurnTimer();
        this.broadcast();
    }

    private startTurnTimer() {
        this.turnStartTimestamp = Date.now();
        if (this.turnTimeout) {
            clearTimeout(this.turnTimeout);
        }
        this.turnTimeout = setTimeout(() => {
            // If time runs out, auto-pick a cell for current player
            this.handleTurnTimeout();
        }, this.turnTimeLimit);
    }

    private get turnTimeLimit() {
    return (this.config.turnSeconds ?? 30) * 1000;
    }

    private get remainingTurnTime() {
        if (this.turnStartTimestamp) {
            return Math.max(0, this.turnTimeLimit - (Date.now() - this.turnStartTimestamp));
        }
        return this.turnTimeLimit;
    }

    private get currentPlayerId() {
        return this.turnOrder[this.currentTurnIndex];
    }

    private handleTurnTimeout() {
        // TODO: Implement random cell pick for current player
        // For now, just log and move to next turn
        console.log(`Turn timeout for player ${this.currentPlayerId}`);
        // this.recordMove(this.currentPlayerId, this.pickRandomCell());
        this.nextTurn();
    }

    private nextTurn() {
        this.currentTurnIndex = (this.currentTurnIndex + 1) % this.turnOrder.length;
        this.startTurnTimer();
        this.broadcast();
    }

    /**
     * Stub: Injects AI players to fill up to minPlayers before game starts.
     * TODO: Implement actual AI player logic.
     */
    private injectAIPlayers(count: number) {
        for (let i = 0; i < count; i++) {
            const aiPlayer = AIManager.createAIPlayer(this.config);
            this.players.push(aiPlayer);
            this.sockets.add(aiPlayer);
            aiPlayer.send(JSON.stringify({ type: 'joined', gameId: this.id, aiPlayer }));
        }
        this.broadcast();
    }

    /**
     * Reset manager for a new game after finishing/cleanup.
     * Assigns new id, clears players, sets state to 'ready'.
     */
    private reset(): void {
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



}
