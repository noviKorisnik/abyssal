# Game Logging Quick Reference

## 📊 What Gets Logged
Complete broadcast message when game completes:
- Full game state
- All players and rankings
- Complete move history
- Final board layout

## 📁 Log Location
```
server/logs/YYYY-MM-DD.jsonl
```
One file per day (e.g., `2025-10-11.jsonl`)

## 🔧 Check Activity

### View today's games
```bash
# Linux/Mac
cat logs/$(date +%Y-%m-%d).jsonl | jq

# Windows (PowerShell)
cat logs/$(Get-Date -Format "yyyy-MM-dd").jsonl | jq

# Manual (replace with today's date)
cat logs/2025-10-11.jsonl | jq
```

### Count games today
```bash
wc -l logs/2025-10-11.jsonl
```

### Watch live
```bash
tail -f logs/2025-10-11.jsonl
```

### List all log files
```bash
ls -lt logs/
```

## 📋 Log Format
```json
{
  "timestamp": "2025-10-11T12:34:56.789Z",
  "data": {
    "phase": "done",
    "gameId": "...",
    "players": [...],
    "done": { "winnerId": "...", "placements": [...] },
    "history": [...],
    "boardLayout": {...}
  }
}
```

## 🔍 Extract Info
```bash
# Get winner IDs
cat logs/2025-10-11.jsonl | jq '.data.done.winnerId'

# Count players per game
cat logs/2025-10-11.jsonl | jq '.data.players | length'

# View last game
tail -n 1 logs/2025-10-11.jsonl | jq
```

## ⚙️ Implementation
- **Automatic**: Logs in `broadcast()` when `state === 'done'`
- **Daily files**: New file each day
- **Format**: JSON Lines (one JSON per line)
- **Safe**: Errors won't crash server

## 📖 Full Documentation
See `GAME_LOGGING.md` for complete details.
