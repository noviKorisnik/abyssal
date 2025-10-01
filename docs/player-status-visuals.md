# Player Status Visual System

This document describes the visual status system for players in the active game.

## Player Status Component

Located at: `client/src/app/game/player-status/`

### Status Types & Visual Indicators

#### 1. **In Game** (Normal State)
- **Appearance**: Solid colored disc with subtle white shadow
- **Meaning**: Player is active and waiting for their turn
- **Visual**: Normal opacity, standard background

#### 2. **On Turn** (Active Player)
- **Appearance**: Highlighted with pulsing animation
- **Features**:
  - Brighter background
  - White border
  - Pulsing glow effect around disc
  - Bold player name
  - Disc has enhanced shadow and glow
- **Animation**: Subtle pulse every 2 seconds
- **Meaning**: This player is currently taking their turn

#### 3. **Done** (Eliminated)
- **Appearance**: Hollow circle (no fill)
- **Features**:
  - 60% opacity (faded out)
  - Border-only disc (3px solid)
  - Strikethrough on player name
  - Reduced name opacity
- **Meaning**: All of this player's ships are sunk

#### 4. **Disconnected**
- **Appearance**: Very faded
- **Features**:
  - 30% opacity
  - No shadow on disc
  - Italic player name
- **Meaning**: Player has disconnected from the game

### Current User Indicator

Your own player card has:
- Distinct border (semi-transparent white)
- Slightly brighter background
- When it's your turn: even stronger border and background

## Board Visual Feedback

### Your Turn Indication

When it's your turn, the game board itself provides visual feedback:

1. **Board Border**: White glowing border (3px)
2. **Box Shadow**: Multi-layered glow effect
3. **Pulsing Animation**: Subtle pulse every 2 seconds
4. **Container Background**: Slightly brighter background color

### Timer Label

The countdown timer displays the **current player's name** instead of generic "Turn" label.

Example: "Swift Warrior" (with their player color)

## Color System

Uses the same HSL color palette as the game board:
- **Player 0**: Red-Orange (hsl(312, 70%, 50%))
- **Player 1**: Yellow-Orange (hsl(24, 70%, 50%))
- **Player 2**: Yellow-Green (hsl(96, 70%, 50%))
- **Player 3**: Teal (hsl(168, 70%, 50%))

## Layout

```
┌─────────────────────────────────┐
│      Active Game Title          │
├─────────────────────────────────┤
│  [Player Status Panel]          │
│  ● Player1  ◉ Player2  ○ Player3│
│  in-game    on-turn    done     │
├─────────────────────────────────┤
│  Timer: "Player2"               │
│  [====================] 15      │
├─────────────────────────────────┤
│  ┌──────────────────────────┐  │
│  │  [Game Board Grid]       │  │ ← Glows when your turn
│  │  [Cells with markers]    │  │
│  └──────────────────────────┘  │
└─────────────────────────────────┘
```

## Removed Elements

The following have been removed as they're now represented visually:

- ❌ "Current Player: [name]" text
- ❌ "Your Turn: Yes/No" text

## Advantages

1. **At-a-glance status**: See all players' states instantly
2. **Clear turn indication**: Pulsing animation draws attention
3. **Color coordination**: Matches game board color scheme
4. **Accessibility**: Multiple visual cues (color, animation, opacity, symbols)
5. **Space efficient**: Horizontal layout fits naturally
6. **Responsive**: Wraps on smaller screens

## Technical Details

- Built as standalone Angular component
- Uses CSS animations (no JavaScript)
- Reactive to game state changes
- Minimal performance impact (CSS transforms only)
