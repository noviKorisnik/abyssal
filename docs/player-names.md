# Player Name System

This feature adds a player name system to the Abyssal multiplayer game, allowing players to choose display names instead of showing user IDs.

## Features

### Name Generation
- **Server-side lists**: ~180 adjectives and ~200 nouns stored in `/server/src/name-generator/`
- **Random combinations**: Generates unique "Adjective Noun" combinations (e.g., "Swift Warrior", "Bold Phoenix")
- **API endpoint**: `GET /api/names?count=8` returns list of random name suggestions

### Player Name Selection
- **First-time setup**: When a player first accesses game setup, they see a name selector
- **Auto-selection**: First name from suggestions is automatically selected
- **Session storage**: Chosen name is saved to browser session storage
- **Name persistence**: Name is remembered for the session
- **Change anytime**: Players can toggle name selector to pick a new name or refresh suggestions

### UI Integration
- **Game Setup**: Name selector shown before board generation
- **Lobby**: Player names displayed in lobby with connection status
- **Active Game**: Current player's name shown during gameplay
- **Fallback**: User ID shown if name not available

## Technical Details

### Server
- `name-generator/adjectives.ts` - List of ~180 adjectives
- `name-generator/nouns.ts` - List of ~200 nouns  
- `name-generator/name-generator.ts` - Generates unique random combinations
- `index.ts` - API endpoint `/api/names`
- Models updated to include optional `playerName` field

### Client
- `services/player-name.service.ts` - Manages name storage and API calls
- Session storage key: `abyssal_player_name`
- Game setup component enhanced with name selection UI
- Game components updated to display player names

### Models Updated
- `GamePlayer` interface: Added `playerName?: string`
- `GameStatusMessage` interface: Players array includes `playerName?: string`
- `GameRoom` interface: Player object includes `playerName?: string`

## Usage

### For Players
1. Start new game - name selector appears automatically
2. Choose from 8 suggested names or click "Get New Names"
3. Selected name is saved for session
4. Click "Change Name" anytime to modify

### For Developers
```typescript
// Get stored name
const name = playerNameService.getStoredPlayerName();

// Fetch new suggestions
playerNameService.fetchNameSuggestions(8).subscribe(names => {
  console.log(names); // Array of 8 unique names
});

// Save chosen name
playerNameService.savePlayerName('Swift Eagle');

// Clear stored name
playerNameService.clearPlayerName();
```

## Future Enhancements
- Move from session storage to local storage for production
- Add custom name input option
- Validate names for profanity
- Add more adjectives/nouns to increase variety
- Allow players to save favorite names
