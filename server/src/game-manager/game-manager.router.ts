import { Router } from "express";
import { GameManager } from "./game-manager";

const router = Router();

// Assign a player to a room, returns game id
router.post("/assign-player", (req, res) => {
    const player = req.body;
    if (!player || !player.userId || !player.setup) {
        return res.status(400).json({ error: "Missing player id or setup" });
    }
    try {
        const manager = GameManager.assignPlayerToRoom(player);
        res.json({ gameId: manager.id });
    } catch (err) {
        res.status(500).json({ error: "Failed to assign player" });
    }
});

export default router;
