# 🎯 Abbysal Multiplayer MVP — Full Conceptual Story

### 1. **Game Entry / Lobby**

* Player enters or creates a game room (3–4 players).
* Lobby shows: avatars/colors, ready status, countdown timer (60s).
* Minimum 3 players required to start.
* Early start possible if ≥3 players and <30s remaining.
* Missing spots filled with preloaded AI sessions.

---

### 2. **Board Setup**

* Player generates or arranges ships on 8×8 board (MVP: only “Generate” button).
* When player hits **Ready**:

  * Board is sent to the server.
  * Player added to the game context.
  * WebSocket connection ensures real-time updates.
* Preloaded AI sessions are ready with boards to join instantly if needed.

---

### 3. **Turn Mechanics**

* Server maintains **turn order** and **timers** (10–20s per turn).
* Active player selects an untapped cell.
* Server resolves hits/misses, including **overlapping ships**.
* Sunk ships are marked with **lines** per player (no full-cell shading to avoid confusion).
* Timer expiry → automatic move by player or AI.
* Layer visibility allows toggling hits, misses, and player-specific sunk lines.

---

### 4. **AI Player Behavior**

* Fully integrated headless player session:

  * **Setup:** generates board and marks ready.
  * **Turn:** receives updates since last move, analyzes board, picks best move within 4s, applies move to shared state.
  * **End Game:** receives final board, optionally logs stats.
* AI behaves identically to human players in game logic.

---

### 5. **End Game**

* Triggered when all but one player’s ships are sunk, or last move eliminates multiple players (including self).
* Winner: last surviving player or last mover in simultaneous elimination.
* Post-game presentation:

  * Final board with all ships visible, hits, and sunk lines.
  * Winner highlighted.
  * Optional layer toggle for exploring overlaps.
* Post-game actions: rematch, save game/replay/share, or exit to main menu.

---

### 6. **Server Responsibilities**

* **Lobby & room management** (player join/leave, countdown, AI fill).
* **Game state management** (boards, hits, misses, sunk info, layers, turn order).
* **Turn handling** (timers, automatic moves, AI integration).
* **End-of-game resolution** (winner determination, board lock, post-game broadcast).
* Real-time communication via **WebSockets**.

---

### 7. **Optional Alpha / Future Enhancements**

* User accounts, statistics, leaderboards.
* Friends / private rooms / invites.
* Advanced AI strategies.
* Replays / saved games.
* Themes / skins / animations / sounds.

---

✅ **Summary**

* MVP supports **real-time multiplayer** (3–4 players), including **AI integration**.
* Core gameplay: **setup → turns → hits/misses → overlapping ships → end-game**.
* Client handles rendering, input, and optional exploration layers.
* Server handles **all authoritative logic**, including AI sessions and shared state.
* Optional future layers can extend engagement without breaking MVP.

