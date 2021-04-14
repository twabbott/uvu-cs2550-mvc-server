const express = require("express");
const router = express.Router();

const { getAllCharacters, getOneCharacter, postCharacter, putCharacter, deleteCharacter } = require("../controllers/characters.ctrl");

router.get("/v1/characters", getAllCharacters);
router.get("/v1/characters/:id", getOneCharacter);
router.post("/v1/characters", postCharacter);
router.put("/v1/characters/:id", putCharacter);
router.delete("/v1/characters/:id", deleteCharacter);

module.exports = router;

