import { GameConfig } from "../game-config";
import { GamePlayer, GameState, GameStatusMessage, GameTurn } from "../game-model";
import { AIManager } from '../ai-manager';
import { GameLogger } from './game-logger';

export class GameManager {
    // Track eliminated players
    private eliminatedPlayers: Set<string> = new Set();
    // Track when each player was eliminated (turn number)
    private playerEliminationTurn: Map<string, number> = new Map();
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

    // --- Silent Broadcast Simulation ---
    // When enabled, game auto-plays first N turns silently (zero turn time, no broadcasts)
    // then switches to normal mode. Useful for testing end-game scenarios.
    // See: server/src/game-manager/SILENT_BROADCAST.md for details
    private silentBroadcast: boolean = false;       // Enable simulation (set false for normal mode)
    private silentBroadcastCount: number = 56;     // Number of turns to simulate (out of 64 max)

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
            this.broadcast(); // Logging happens inside broadcast when state is 'done'
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

        // First, mark all players whose ships are sunk (but don't add to eliminated set yet)
        const playersToEliminate: string[] = [];
        for (const [playerId, layer] of this.playerBoards.entries()) {
            if (this.eliminatedPlayers.has(playerId)) continue;
            if (layer.ships.length > 0 && layer.ships.every(ship => ship.isSunk)) {
                playersToEliminate.push(playerId);
            }
        }

        // Check if current player wins by eliminating all opponents
        // (even if their own ships are also sunk in this move)
        const opponentsToEliminate = playersToEliminate.filter(p => p !== turn.playerId);
        const currentPlayerWouldBeEliminated = playersToEliminate.includes(turn.playerId);

        // Count active opponents after this move (excluding current player)
        const activeOpponents = Array.from(this.playerBoards.keys()).filter(
            id => id !== turn.playerId &&
                !this.eliminatedPlayers.has(id) &&
                !opponentsToEliminate.includes(id)
        );

        // If current player eliminates all opponents with this move, they win
        // (even if their own ships also got sunk)
        if (activeOpponents.length === 0 && currentPlayerWouldBeEliminated) {
            // Current player made the winning move - don't eliminate them
            console.log(`Player ${turn.playerId} wins by eliminating all opponents (including self-sacrifice)`);
            playersToEliminate.splice(playersToEliminate.indexOf(turn.playerId), 1);
        }

        // Now actually eliminate the players
        for (const playerId of playersToEliminate) {
            this.eliminatedPlayers.add(playerId);
            // Record the turn number when eliminated
            this.playerEliminationTurn.set(playerId, this.gameTurns.length);
            console.log(`Player ${playerId} eliminated at turn ${this.gameTurns.length}`);
        }

        // Note: We keep turnOrder unchanged - nextTurn() will skip eliminated players
    }

    // Check for game end: only one player remains (or zero if all eliminated simultaneously)
    private isGameDone(): boolean {
        const activePlayers = Array.from(this.playerBoards.keys()).filter(
            id => !this.eliminatedPlayers.has(id)
        );
        return activePlayers.length <= 1;
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
                } catch { }
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
        if (this.isFullBroadcast()) {
            const active = this.activeState; // Force evaluation for logging
            // console.log('[broadcast] Active state:', active);

            const message: GameStatusMessage = {
                type: 'state',
                phase: this.state,
                gameId: this.id,
                players: this.playerList(),
                ready: this.readyState,
                active,
                done: this.doneState,
                history: this.historyState,
                boardLayout: this.boardLayoutState,
            };
            
            // Log completed games to daily file
            if (this.state === 'done') {
                GameLogger.logGameBroadcast(message);
            }
            
            const msg = JSON.stringify(message);
            for (const sock of this.sockets) {
                try { sock.send(msg); } catch (err) { /* handle error */ }
            }
        }
    }

    private isFullBroadcast() {
        if (!this.silentBroadcast) return true;
        if (this.state !== 'active') return true;
        if (this.historyState && this.historyState.length >= this.silentBroadcastCount) this.silentBroadcast = false;
        return !this.silentBroadcast;
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
        // Winner is the last active player (or no winner if all eliminated simultaneously)
        const activePlayers = this.players.map(p => p.userId).filter(id => !this.eliminatedPlayers.has(id));
        const winnerId = activePlayers.length === 1 ? activePlayers[0] : "";

        // Build rankings using stored elimination turns
        // Group players by elimination turn
        const turnToPlayers: Record<number, string[]> = {};
        for (const [playerId, turn] of this.playerEliminationTurn.entries()) {
            // Skip the winner
            if (playerId === winnerId) continue;

            if (!turnToPlayers[turn]) turnToPlayers[turn] = [];
            turnToPlayers[turn].push(playerId);
        }

        console.log('[doneState] Players grouped by elimination turn:', turnToPlayers);

        // Build placements: later elimination = better rank (survived longer)
        // Players eliminated on same turn share the same rank
        const allTurns = Object.keys(turnToPlayers).map(Number).sort((a, b) => b - a);
        let currentRank = 2; // winner is always rank 1
        const placements: Array<{ userId: string; rank: number }> = [];

        if (winnerId) {
            placements.push({ userId: winnerId, rank: 1 });
        }

        // Assign ranks: players eliminated later get better ranks
        for (const turn of allTurns) {
            const playersAtThisTurn = turnToPlayers[turn];
            for (const pid of playersAtThisTurn) {
                placements.push({ userId: pid, rank: currentRank });
            }
            // Next rank is current rank + number of players at this turn
            currentRank += playersAtThisTurn.length;
        }

        console.log('[doneState] Final placements:', placements);

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
            playerName: p.playerName,
            connected: Array.from(this.sockets).some(sock => sock.userId === p.userId),
            eliminatedAtTurn: this.playerEliminationTurn.get(p.userId) // undefined if not eliminated
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
        // Sync interval not needed - client handles smooth countdown animation
        // Server broadcasts on every turn start with accurate remainingTurnTime
        // if (this.turnSyncInterval) {
        //     clearInterval(this.turnSyncInterval);
        // }

        this.turnTimeout = setTimeout(() => {
            // If time runs out, auto-pick a cell for current player
            this.handleTurnTimeout();
        }, this.turnTimeLimit);

        // No need for sync broadcasts - client animates smoothly between turn changes
        // this.turnSyncInterval = setInterval(() => {
        //     if (this.state === 'active' && this.turnStartTimestamp) {
        //         this.broadcast();
        //     } else {
        //         this.clearTurnSyncInterval();
        //     }
        // }, 3000);
    }

    private clearTurnSyncInterval() {
        if (this.turnSyncInterval) {
            clearInterval(this.turnSyncInterval);
            this.turnSyncInterval = null;
        }
    }

    private get turnTimeLimit() {
        return this.silentBroadcast ? 0 : (this.config.turnSeconds ?? 30) * 1000;
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
        if (this.turnOrder.length === 0) {
            console.warn('No players in turn order');
            return;
        }

        // Advance to next non-eliminated player
        const startIndex = this.currentTurnIndex;
        do {
            this.currentTurnIndex = (this.currentTurnIndex + 1) % this.turnOrder.length;
            // Safety check: if we've looped back to start, break to prevent infinite loop
            if (this.currentTurnIndex === startIndex && this.eliminatedPlayers.has(this.turnOrder[this.currentTurnIndex])) {
                console.warn('All players eliminated, cannot advance turn');
                return;
            }
        } while (this.eliminatedPlayers.has(this.turnOrder[this.currentTurnIndex]));

        this.startTurnTimer();
        this.broadcast();
    }

    /**
     * Injects AI players to fill up to minPlayers before game starts.
     * AI players will automatically make moves when it's their turn.
     */
    private injectAIPlayers(count: number) {
        for (let i = 0; i < count; i++) {
            const aiPlayer = AIManager.createAIPlayer(this.config);
            
            // Set up callback so AI can send messages back to game manager
            aiPlayer.setGameManagerCallback((message: any) => {
                // AI sends messages to game manager (e.g., pickCell)
                this.dispatch(message);
            });
            
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
        this.playerEliminationTurn.clear();
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
