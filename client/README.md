# Abyssal Client

Angular frontend for the Abyssal multiplayer naval strategy game.

## Tech Stack

- **Framework**: Angular 17+
- **Language**: TypeScript
- **Styling**: SCSS
- **Real-time**: Socket.IO Client
- **Architecture**: Vertical-slice architecture

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The client will be available at `http://localhost:4200`.

### Building

```bash
npm run build       # Development build
npm run build:prod  # Production build
```

## Project Structure

```
src/
├── app/
│   ├── features/           # Feature modules (vertical slices)
│   │   ├── game/          # Game interface feature
│   │   ├── lobby/         # Lobby/matchmaking feature
│   │   └── home/          # Home page feature
│   ├── shared/            # Shared components and utilities
│   ├── core/              # Core services and guards
│   ├── app.component.*    # Root application component
│   ├── app.config.ts      # Application configuration
│   └── app.routes.ts      # Application routing
├── assets/                # Static assets
└── styles.scss           # Global styles
```

## Vertical-Slice Architecture

Each feature is organized as a complete vertical slice:

```
features/[feature-name]/
├── README.md                   # Feature documentation
├── [feature].component.ts      # Main feature component
├── components/                 # Feature-specific components
├── services/                   # Feature-specific services
├── models/                     # Feature-specific models
└── [feature].routes.ts         # Feature routing (if complex)
```

## Features

### Home Feature
- Landing page
- Game introduction
- Navigation to other features

### Lobby Feature
- Game lobby and matchmaking
- Available games list
- Create new game functionality
- Player statistics

### Game Feature
- Interactive game board
- Real-time gameplay
- Move validation
- Game chat
- Ship placement
- Battle results

## Services

### Core Services
- `WebSocketService` - Real-time communication
- `ApiService` - HTTP API communication
- `AuthService` - Player authentication (future)

### Feature Services
- `GameService` - Game state management
- `LobbyService` - Lobby functionality
- `PlayerService` - Player management

## Testing

```bash
npm test           # Run unit tests
npm run test:ci    # Run tests in CI mode
npm run e2e        # Run end-to-end tests
```

## Linting

```bash
npm run lint       # Check for linting issues
```

## Environment Configuration

Configuration files are located in `src/environments/`:
- `environment.ts` - Development configuration
- `environment.prod.ts` - Production configuration

### Environment Variables

- `API_URL` - Backend API URL
- `WS_URL` - WebSocket server URL