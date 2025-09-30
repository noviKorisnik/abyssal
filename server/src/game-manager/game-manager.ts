import { GameConfig } from "../game-config";
import { GamePlayer, GameState, GameStatusMessage, GameTurn } from "../game-model";
import { AIManager } from '../ai-manager';

export class GameManager {
    // Track eliminated players
    private eliminatedPlayers: Set<string> = new Set();
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
    private turnSyncInterval: NodeJS.Timeout | null = null;

    // Track all game turns (moves)
    private gameTurns: GameTurn[] = [];

    // Base layer: tracks all played cells
    private baseBoard: Set<string> = new Set(); // e.g., "x,y" for each played cell
    // Player layers: board and ships per player
    private playerBoards: Map<string, PlayerBoardLayer> = new Map();

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
        if (this.state !== 'active') {
            console.warn(`Received pickCell in non-active state: ${this.state}`);
            return;
        }
        // 1. Validate turn ownership
        if (userId !== this.currentPlayerId) {
            console.warn(`Player ${userId} attempted move out of turn.`);
            return;
        }

        // 2. Validate cell selection (stub: implement bounds and already-picked check)
        if (!this.isCellValid(cell)) {
            console.warn(`Player ${userId} picked invalid cell (${cell.x},${cell.y})`);
            return;
        }

        // 3. Process move (stub: update board, check hits/sinks)
        // TODO: Implement game-specific logic here
        const moveOutcome = this.processMove(userId, cell);

        // 4. Apply move: update all game turn dependent structures
        this.applyMove(moveOutcome);

        if (this.isGameDone()) {
            this.state = 'done';
            this.broadcast();
        } else {
            this.nextTurn();
        }
    }

    // Stub: Validate cell selection
    private isCellValid(cell: { x: number; y: number }): boolean {
        // Bounds check
        if (
            cell.x < 0 || cell.x >= this.config.boardCols ||
            cell.y < 0 || cell.y >= this.config.boardRows
        ) {
            return false;
        }
        // Already picked check
        // return this.gameTurns.every(turn => turn.cell.x !== cell.x || turn.cell.y !== cell.y);
        
    // Already picked check using baseBoard
    return !this.baseBoard.has(`${cell.x},${cell.y}`);

    }

    // Process move and return GameTurn value (does not update board state)
    private processMove(userId: string, cell: { x: number; y: number }): GameTurn {
        // hits: list of playerIds whose ship was hit (but not sunk)
        // sinks: list of playerIds whose ship was sunk (not in hits)
        const hits: string[] = [];
        const sinks: string[] = [];

        for (const [opponentId, layer] of this.playerBoards.entries()) {
            let hitShip = null;
            let sunkShip = null;
            for (const ship of layer.ships) {
                const isHit = ship.cells.some(c => c.x === cell.x && c.y === cell.y);
                if (isHit) {
                    // Check if this hit would sink the ship (all cells of ship are hit)
                    const allHits = ship.cells.every(sc =>
                        this.gameTurns.some(turn => turn.cell.x === sc.x && turn.cell.y === sc.y)
                        || (sc.x === cell.x && sc.y === cell.y)
                    );
                    if (allHits) {
                        sunkShip = true;
                    } else {
                        hitShip = true;
                    }
                    break; // Only one ship per cell
                }
            }
            if (sunkShip) {
                sinks.push(opponentId);
            } else if (hitShip) {
                hits.push(opponentId);
            }
        }

        return {
            playerId: userId,
            cell,
            hits,
            sinks
        };
    }

    // Apply move: update gameTurns, baseBoard, and playerBoards
    private applyMove(turn: GameTurn): void {
        // Add to history
        this.gameTurns.push(turn);
        // Update baseBoard
        this.baseBoard.add(`${turn.cell.x},${turn.cell.y}`);
        // Update playerBoards: mark hits and sunk ships
        for (const playerId of [...turn.hits, ...turn.sinks]) {
            const layer = this.playerBoards.get(playerId);
            if (!layer) continue;
            // Mark cell as hit on board
            if (layer.board[turn.cell.y] && layer.board[turn.cell.y][turn.cell.x]) {
                layer.board[turn.cell.y][turn.cell.x].isHit = true;
            }
            // If sunk, mark ship as sunk
            if (turn.sinks.includes(playerId)) {
                for (const ship of layer.ships) {
                    if (ship.cells.some(c => c.x === turn.cell.x && c.y === turn.cell.y)) {
                        ship.isSunk = true;
                    }
                }
            }
        }
        // Eliminate players whose ships are all sunk
        for (const [playerId, layer] of this.playerBoards.entries()) {
            if (this.eliminatedPlayers.has(playerId)) continue;
            if (layer.ships.length > 0 && layer.ships.every(ship => ship.isSunk)) {
                this.eliminatedPlayers.add(playerId);
                // Remove from turnOrder
                this.turnOrder = this.turnOrder.filter(id => id !== playerId);
            }
        }
    }

    // Check for game end: all other players' ships are sunk
    private isGameDone(): boolean {
        for (const [playerId, layer] of this.playerBoards.entries()) {
            if (playerId === this.currentPlayerId) continue;
            // If any other player has at least one unsunk ship, game is not done
            if (layer.ships.some(ship => !ship.isSunk)) {
                return false;
            }
        }
        // All other players' ships are sunk
        return true;
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
        // Winner is the last active player
        const activePlayers = this.players.map(p => p.userId).filter(id => !this.eliminatedPlayers.has(id));
        const winnerId = activePlayers.length === 1 ? activePlayers[0] : "";

        // Track elimination turn for each player
        const eliminatedAtTurn: Record<string, number> = {};
        for (let turnIdx = 0; turnIdx < this.gameTurns.length; turnIdx++) {
            const turn = this.gameTurns[turnIdx];
            for (const pid of turn.sinks) {
                if (!(pid in eliminatedAtTurn) && this.eliminatedPlayers.has(pid)) {
                    eliminatedAtTurn[pid] = turnIdx + 1; // 1-based turn index
                }
            }
        }
        // Add any eliminated players not in eliminatedAtTurn (edge case)
        for (const pid of this.eliminatedPlayers) {
            if (!(pid in eliminatedAtTurn)) {
                eliminatedAtTurn[pid] = this.gameTurns.length; // eliminated at last turn
            }
        }
        // Winner's turn: one higher than max
        const winnerTurn = Math.max(0, ...Object.values(eliminatedAtTurn)) + 1;

        // Group players by elimination turn
        const turnToPlayers: Record<number, string[]> = {};
        for (const [pid, turn] of Object.entries(eliminatedAtTurn)) {
            if (!turnToPlayers[turn]) turnToPlayers[turn] = [];
            turnToPlayers[turn].push(pid);
        }
        // Build placements: higher turn = better rank, winner gets best
        const allTurns = Object.keys(turnToPlayers).map(Number).sort((a, b) => b - a);
        let currentRank = 2; // winner is always rank 1
        const placements: Array<{ userId: string; rank: number }> = [];
        if (winnerId) {
            placements.push({ userId: winnerId, rank: 1 });
        }
        for (const turn of allTurns) {
            for (const pid of turnToPlayers[turn]) {
                placements.push({ userId: pid, rank: currentRank });
            }
            currentRank++;
        }
        return {
            winnerId,
            placements
        };
    }

    private get historyState() {
        if (!['active', 'done'].includes(this.state)) return undefined;
        // Return full game history
        return this.gameTurns.slice();
    }

    private get boardLayoutState() {
        if (!['active', 'done'].includes(this.state)) return undefined;
        // Build baseBoard as 2D array (0: not played, 1: played)
        const baseBoard: number[][] = [];
        for (let y = 0; y < this.config.boardRows; y++) {
            const row: number[] = [];
            for (let x = 0; x < this.config.boardCols; x++) {
                row.push(this.baseBoard.has(`${x},${y}`) ? 1 : 0);
            }
            baseBoard.push(row);
        }

        // Build playerLayers with 'active' field
        const playerLayers = Array.from(this.playerBoards.values()).map(layer => {
            // revealedBoard: 2D array of hits (1: hit, 0: not hit)
            const revealedBoard: number[][] = [];
            for (let y = 0; y < this.config.boardRows; y++) {
                const row: number[] = [];
                for (let x = 0; x < this.config.boardCols; x++) {
                    row.push(layer.board[y][x].isHit ? 1 : 0);
                }
                revealedBoard.push(row);
            }
            // sunkShips: list of sunk ships and their cells
            const sunkShips = layer.ships.filter(ship => ship.isSunk).map(ship => ({
                shipId: ship.shipId,
                cells: ship.cells
            }));
            return {
                playerId: layer.playerId,
                revealedBoard,
                sunkShips,
                active: !this.eliminatedPlayers.has(layer.playerId) && this.state === 'active',
            };
        });

        return {
            baseBoard,
            playerLayers
        };
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

    private initPlayerBoards() {
        this.playerBoards = new Map();
        for (const player of this.players) {
            // Build board and ships from player setup
            const board: Array<Array<{ hasShip: boolean; isHit: boolean }>> = [];
            for (let y = 0; y < this.config.boardRows; y++) {
                const row: Array<{ hasShip: boolean; isHit: boolean }> = [];
                for (let x = 0; x < this.config.boardCols; x++) {
                    // Assume player.setup.board[y][x] exists and is boolean (hasShip)
                    row.push({ hasShip: !!player.setup.board?.[y]?.[x], isHit: false });
                }
                board.push(row);
            }
            // Build ships from player.setup.ships, mapping cells to { x, y }
            const ships = (player.setup.ships ?? []).map(ship => ({
                shipId: ship.id,
                cells: ship.cells.map(cell => ({ x: cell.col, y: cell.row })),
                isSunk: false
            }));
            this.playerBoards.set(player.userId, {
                playerId: player.userId,
                board,
                ships
            });
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
        // Initialize board layout structures
        this.baseBoard = new Set();
        this.initPlayerBoards();
        this.startTurnTimer();
        this.broadcast();
    }

    private startTurnTimer() {
        this.turnStartTimestamp = Date.now();
        if (this.turnTimeout) {
            clearTimeout(this.turnTimeout);
        }
        if (this.turnSyncInterval) {
            clearInterval(this.turnSyncInterval);
        }
        
        this.turnTimeout = setTimeout(() => {
            // If time runs out, auto-pick a cell for current player
            this.handleTurnTimeout();
        }, this.turnTimeLimit);

        // Broadcast timer updates every 3 seconds to keep clients synchronized
        // (reduced frequency since client now has smooth 25ms animation)
        this.turnSyncInterval = setInterval(() => {
            if (this.state === 'active' && this.turnStartTimestamp) {
                this.broadcast();
            } else {
                this.clearTurnSyncInterval();
            }
        }, 3000);
    }

    private clearTurnSyncInterval() {
        if (this.turnSyncInterval) {
            clearInterval(this.turnSyncInterval);
            this.turnSyncInterval = null;
        }
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
        // Pick a random available cell for the current player
        const availableCells: Array<{ x: number; y: number }> = [];
        for (let y = 0; y < this.config.boardRows; y++) {
            for (let x = 0; x < this.config.boardCols; x++) {
                if (!this.baseBoard.has(`${x},${y}`)) {
                    availableCells.push({ x, y });
                }
            }
        }
        if (availableCells.length === 0) {
            // No available cells, just skip turn
            console.log(`Turn timeout for player ${this.currentPlayerId}, but no available cells.`);
            this.nextTurn();
            return;
        }
        // Pick random cell
        const pick = availableCells[Math.floor(Math.random() * availableCells.length)];
        console.log(`Turn timeout for player ${this.currentPlayerId}, auto-picking cell (${pick.x},${pick.y})`);
        // Call handlePickCell as if player picked this cell
        this.handlePickCell(this.currentPlayerId, pick);
    }

    private nextTurn() {
        if (this.turnOrder.length === 0) return;
        do {
            this.currentTurnIndex = (this.currentTurnIndex + 1) % this.turnOrder.length;
        } while (this.eliminatedPlayers.has(this.turnOrder[this.currentTurnIndex]) && this.turnOrder.length > 1);
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
        this.gameTurns = [];
        this.baseBoard = new Set();
        this.playerBoards = new Map();
        // Clear eliminated players
        this.eliminatedPlayers.clear();
        // Reset turn state
        this.turnOrder = [];
        this.currentTurnIndex = 0;
        this.turnStartTimestamp = null;
        // Clear timers
        if (this.lobbyTimeout) {
            clearTimeout(this.lobbyTimeout);
            this.lobbyTimeout = null;
        }
        if (this.turnTimeout) {
            clearTimeout(this.turnTimeout);
            this.turnTimeout = null;
        }
        this.clearTurnSyncInterval();
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

// Type for player board layer
interface PlayerBoardLayer {
    playerId: string;
    board: Array<Array<{ hasShip: boolean; isHit: boolean }>>;
    ships: Array<{ shipId: string; cells: Array<{ x: number; y: number }>; isSunk: boolean }>;
}
