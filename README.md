# Abyssal

**Abyssal: Sink Deep, Play Smart**  
Multiplayer naval strategy game inspired by Battleship, featuring human and AI players with vertical-slice architecture and modular server/client projects.

---

## Overview

Abyssal is a multiplayer strategy game where players compete to sink each other's ships.  
The project uses **vertical slice architecture**: each feature is self-contained with a single public entry point, independent logic, and optional feature README.

Key goals:
- Clear modular architecture for both backend and frontend
- Support for AI players (Cohere, Gemini, or fallback bots)
- Clean guidance for developers and AI agents
- Easy to extend with new features or game modes

---

## Repo Structure

The repository contains two main projects:

- **[Server](./server)** – Node.js backend, WebSockets + REST, database integration, AI adapters, vertical-slice architecture  
- **[Client](./client)** – Angular frontend, feature-aligned with server, modular UI, AI integration  

> Each feature folder includes:
> - Feature README (`README.md`)
> - Public entry (`index.ts`)
> - All feature-specific logic

---

## Contributing

Please follow these rules when contributing or developing new features:

1. **Vertical-slice architecture**
   - Each feature lives in its own folder with a single public entry (`index.ts`)  
   - Internal logic should **not** be accessed directly by other features  

2. **Type guidance**
   - Resolvers: use **functions**, not classes  
   - Services: single responsibility, expose only public methods  
   - Repositories: use TypeORM, do **not** expose raw queries outside  

3. **Feature READMEs**
   - Each feature can have its own README with:
     - Purpose and responsibility
     - Public API / entry points
     - Example usage
     - Any AI guidance

4. **AI agent instructions**
   - Respect feature boundaries and public entry points
   - Follow coding conventions and type guidance

---

## Getting Started

Instructions for running server and client locally will be added here.

---

## License

This project is licensed under the [Apache License 2.0](./LICENSE).
