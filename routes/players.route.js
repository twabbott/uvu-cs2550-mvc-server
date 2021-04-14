const express = require("express");
const router = express.Router();

const { getAllPlayers, getOnePlayer, postPlayer, putPlayer, deletePlayer } = require("../controllers/players.ctrl");

router.get("/v1/players", getAllPlayers);
router.get("/v1/players/:id", getOnePlayer);
router.post("/v1/players", postPlayer);
router.put("/v1/players/:id", putPlayer);
router.delete("/v1/players/:id", deletePlayer);

module.exports = router;

