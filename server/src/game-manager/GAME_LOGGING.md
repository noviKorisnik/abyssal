# Game Logging System

## Overview
The server automatically logs every completed game broadcast to daily files.

## How It Works

### Automatic Logging
- When a game transitions to `done` state, the broadcast message is logged
- Logs are written to daily files: `logs/YYYY-MM-DD.jsonl`
- One entry per completed game

### Log Entry Format
```json
{
  "timestamp": "2025-10-11T12:34:56.789Z",
  "data": {
    "type": "state",
    "phase": "done",
    "gameId": "abc123",
    "players": [...],
    "done": {
      "winnerId": "user1",
      "placements": [...]
    },
    "history": [...],
    "boardLayout": {...}
  }
}
```

The `data` field contains the complete broadcast message sent to clients, including:
- Game ID and phase
- All players
- Winner and final rankings
- Complete game history (all moves)
- Final board layout

### Example Log Entry
```json
{
  "timestamp": "2025-10-11T12:34:56.789Z",
  "data": {
    "type": "state",
    "phase": "done",
    "gameId": "gm_abc123",
    "players": [
      { "userId": "user1", "playerName": "Captain Hook" },
      { "userId": "user2", "playerName": "Blackbeard" },
      { "userId": "ai_001", "playerName": "Rusty Navigator" },
      { "userId": "ai_002", "playerName": "Sunken Oracle" }
    ],
    "done": {
      "winnerId": "user1",
      "placements": [
        { "userId": "user1", "rank": 1 },
        { "userId": "user2", "rank": 2 },
        { "userId": "ai_001", "rank": 3 },
        { "userId": "ai_002", "rank": 4 }
      ]
    },
    "history": [
      { "playerId": "user1", "cell": { "x": 3, "y": 4 }, "result": "hit", ... },
      ...
    ],
    "boardLayout": { ... }
  }
}
```

## Log File Location
- Directory: `server/logs/`
- Format: `YYYY-MM-DD.jsonl` (e.g., `2025-10-11.jsonl`)
- One file per day
- Files created automatically on first game completion each day

## Reading Logs

### View Today's Games
```bash
# View all games from today
cat logs/2025-10-11.jsonl

# Pretty print with jq
cat logs/2025-10-11.jsonl | jq

# Count games today
wc -l logs/2025-10-11.jsonl
```

### View Latest Game
```bash
# Last game from today
tail -n 1 logs/2025-10-11.jsonl | jq
```

### Watch Live
```bash
# Watch games as they complete (use today's date)
tail -f logs/2025-10-11.jsonl
```

### Search Across Days
```bash
# Find all games from October
cat logs/2025-10-*.jsonl | jq

# Count total games this month
cat logs/2025-10-*.jsonl | wc -l

# Find games won by specific player
grep "user123" logs/*.jsonl
```

## Use Cases

### Monitor Activity
Check if players are actively playing:
```bash
# See recent games
ls -lt logs/
tail -f logs/$(date +%Y-%m-%d).jsonl
```

### Analyze Games
Extract specific information:
```bash
# Get all winner IDs from today
cat logs/2025-10-11.jsonl | jq '.data.done.winnerId'

# Count players per game
cat logs/2025-10-11.jsonl | jq '.data.players | length'

# Get game IDs
cat logs/2025-10-11.jsonl | jq '.data.gameId'
```

### Debugging
- Complete game state is preserved in broadcast message
- Can replay entire game from history
- Board layout shows final state
- All player data available

## File Management

### Daily Rotation
- Logs automatically rotate to new file each day
- No configuration needed
- Old logs never deleted (manual cleanup required)

### File Size
- Each game entry: ~2-10 KB (varies by game length)
- Typical daily file: depends on activity
- JSON Lines format for easy parsing

## Notes
- Logs directory created automatically on server start
- Logging failures won't crash server (errors logged to console)
- Complete broadcast data preserved (can reconstruct entire game)
- Timestamp in ISO 8601 format (UTC)
- No sensitive data logged beyond what's in broadcast

