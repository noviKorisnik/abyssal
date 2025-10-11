import * as fs from 'fs';
import * as path from 'path';

/**
 * Game Logger
 * 
 * Logs completed game broadcasts to daily files.
 * Simple append-only logging with date-based file rotation.
 */

export class GameLogger {
    private static logDir = path.join(process.cwd(), 'logs');

    /**
     * Initialize the logger - create logs directory if needed
     */
    static initialize(): void {
        if (!fs.existsSync(GameLogger.logDir)) {
            fs.mkdirSync(GameLogger.logDir, { recursive: true });
            console.log('[GameLogger] Created logs directory:', GameLogger.logDir);
        }
    }

    /**
     * Log a completed game broadcast
     */
    static logGameBroadcast(broadcastData: any): void {
        try {
            // Ensure logs directory exists
            GameLogger.initialize();

            // Get today's date for filename (YYYY-MM-DD format)
            const today = new Date().toISOString().split('T')[0];
            const logFile = path.join(GameLogger.logDir, `${today}.jsonl`);

            // Create log entry with timestamp and broadcast data
            const logEntry = {
                timestamp: new Date().toISOString(),
                data: broadcastData
            };

            // Append as JSON Lines format (one JSON object per line)
            const logLine = JSON.stringify(logEntry) + '\n';
            fs.appendFileSync(logFile, logLine, 'utf8');

            console.log('[GameLogger] Game logged to', `${today}.jsonl`);
        } catch (error) {
            console.error('[GameLogger] Failed to log game:', error);
        }
    }
}
