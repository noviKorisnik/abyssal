# Abyssal

Abyssal: Sink Deep, Play Smart - Multiplayer naval strategy game inspired by Battleship, featuring human and AI players with vertical-slice architecture and modular server/client projects.

## 🎮 Game Overview

Abyssal is a modern take on the classic Battleship game, designed for multiplayer naval strategy combat. Battle against human players and AI opponents in epic maritime warfare using cutting-edge web technologies.

## 🏗️ Project Structure

This is a monorepo workspace containing three main packages:

```
abyssal/
├── server/           # Node.js backend (TypeScript)
├── client/           # Angular frontend (TypeScript)
├── common/           # Shared types and utilities (TypeScript)
└── package.json      # Workspace configuration
```

## 🛠️ Tech Stack

### Server
- **Runtime**: Node.js 18+
- **Language**: TypeScript
- **Framework**: Express.js
- **WebSocket**: Socket.IO
- **Database**: TypeORM with SQLite (dev) / MongoDB Atlas (prod)
- **Architecture**: Vertical-slice architecture

### Client
- **Framework**: Angular 17+
- **Language**: TypeScript
- **Styling**: SCSS
- **Real-time**: Socket.IO Client
- **Architecture**: Vertical-slice architecture

### Common
- **Language**: TypeScript
- **Purpose**: Shared types, interfaces, and utilities

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or higher
- npm 9 or higher

### Installation

```bash
# Install all dependencies
npm install

# Install individual project dependencies
npm install --workspace=server
npm install --workspace=client
npm install --workspace=common
```

### Development

#### Run both server and client concurrently:
```bash
npm run dev
```

#### Or run individually:
```bash
# Run server only
npm run dev:server

# Run client only
npm run dev:client
```

- **Server**: http://localhost:3000
- **Client**: http://localhost:4200

### Building

```bash
# Build all projects
npm run build

# Build individual projects
npm run build:server
npm run build:client
```

### Testing

```bash
# Run all tests
npm test

# Run individual project tests
npm run test:server
npm run test:client
```

## 📁 Vertical-Slice Architecture

Both server and client follow vertical-slice architecture principles:

### Server Structure
```
server/src/
├── features/           # Feature modules (vertical slices)
│   ├── game/          # Game management
│   ├── player/        # Player management
│   └── lobby/         # Lobby/matchmaking
├── shared/            # Shared utilities and services
├── config/            # Configuration files
└── index.ts           # Application entry point
```

### Client Structure
```
client/src/app/
├── features/           # Feature modules (vertical slices)
│   ├── game/          # Game interface
│   ├── lobby/         # Lobby interface
│   └── home/          # Home page
├── shared/            # Shared components and utilities
├── core/              # Core services and guards
└── app.component.*    # Root application component
```

Each feature is self-contained with its own:
- Components/Controllers
- Services
- Models/Entities
- Routes
- Tests
- README documentation

## 🌐 API Endpoints

### Server API
- `GET /health` - Health check
- `GET /api` - API information
- Feature-specific endpoints under `/api/[feature]`

### WebSocket Events
- Connection management (ping/pong)
- Game state synchronization
- Real-time move updates
- Player presence

## 🗃️ Database

### Development
Uses SQLite with file storage at `./abyssal.db`

### Production
Configured for MongoDB Atlas (connection details in `.env`)

## 🔧 Configuration

Copy the example environment file and configure as needed:

```bash
cd server
cp .env.example .env
```

Edit `.env` with your specific configuration:
- Database settings
- JWT secrets
- Client URL for CORS
- WebSocket configuration

## 🎯 Game Features

### Current
- ✅ Project structure and architecture
- ✅ Server and client setup
- ✅ WebSocket communication foundation
- ✅ Database configuration
- ✅ Routing and navigation

### Planned
- 🚧 Game lobby and matchmaking
- 🚧 Interactive game board
- 🚧 Ship placement mechanics
- 🚧 Turn-based gameplay
- 🚧 Real-time battle system
- 🚧 AI opponents
- 🚧 Player statistics
- 🚧 Game chat

## 🤝 Contributing

1. Each feature should be implemented as a complete vertical slice
2. Follow the established project structure
3. Add feature documentation in feature README files
4. Include tests for new functionality
5. Update this main README for significant changes

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.
