# Abyssal Server

Node.js backend for the Abyssal multiplayer naval strategy game.

## Tech Stack

- **Runtime**: Node.js 18+
- **Language**: TypeScript
- **Framework**: Express.js
- **WebSocket**: Socket.IO
- **Database**: TypeORM with SQLite (development) / MongoDB Atlas (production)
- **Architecture**: Vertical-slice architecture

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm 9+

### Installation

```bash
npm install
```

### Configuration

1. Copy the environment example file:
```bash
cp .env.example .env
```

2. Update the `.env` file with your configuration

### Development

```bash
npm run dev
```

The server will start on `http://localhost:3000` (or the port specified in your `.env` file).

### Building

```bash
npm run build
```

### Production

```bash
npm start
```

## Project Structure

```
src/
├── features/           # Feature modules (vertical slices)
│   ├── game/          # Game management feature
│   ├── player/        # Player management feature
│   └── lobby/         # Lobby/matchmaking feature
├── shared/            # Shared utilities and services
│   ├── routing.ts     # Route setup
│   ├── websocket.ts   # WebSocket setup
│   └── types/         # Shared type definitions
├── config/            # Configuration files
│   └── database.ts    # Database configuration
└── index.ts           # Application entry point
```

## Vertical-Slice Architecture

Each feature is organized as a complete vertical slice:

```
features/[feature-name]/
├── README.md              # Feature documentation
├── index.ts              # Feature entry point
├── [feature].controller.ts # HTTP endpoints
├── [feature].service.ts    # Business logic
├── [feature].entity.ts     # Database entity
├── [feature].dto.ts        # Data transfer objects
├── [feature].websocket.ts  # WebSocket handlers
└── [feature].test.ts       # Feature tests
```

## API Endpoints

- `GET /health` - Health check
- `GET /api` - API information
- Feature-specific endpoints under `/api/[feature]`

## WebSocket Events

- `ping/pong` - Connection health check
- Feature-specific events will be documented in feature READMEs

## Database

### Development (SQLite)
The application uses SQLite for development, with the database file stored as `./abyssal.db`.

### Production (MongoDB Atlas)
For production, configure MongoDB Atlas connection in your `.env` file.

## Testing

```bash
npm test          # Run all tests
npm run test:watch # Run tests in watch mode
```

## Linting

```bash
npm run lint      # Check for linting issues
npm run lint:fix  # Fix linting issues automatically
```