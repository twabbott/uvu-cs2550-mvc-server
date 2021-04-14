const { playerRepository } = require("../models/players.model");

const { NotFoundError, BadRequestError } = require("../middleware/restFactory");

const errorMessages = {
  create: "Error creating new player.",
  read: "Error reading player(s).",
  update: "Error updating player.",
  delete: "Error deleting player"
};

async function createPlayer(req, ctrl) {
  const { name, teamName, number, position, playsOffense, yearsPlayed } = req.body;

  const all = await playerRepository.readAllPlayers(req.userId);
  if (all.length >= 20) {
    throw new BadRequestError("Cannot have more than 20 players.");
  }

  let player = await playerRepository.createPlayer({
    name,
    teamName,
    number,
    position,
    playsOffense,
    yearsPlayed
  }, req.userId);

  // Give a location ID for the header
  ctrl.setLocationId(player._id.toString());

  return player;
}

async function readAllPlayers(req) {
  return await playerRepository.readAllPlayers(req.userId);
}

async function readOnePlayer(req) {
  const playerId = req.params.id;

  const player = await playerRepository.readOnePlayer(playerId, req.userId);
  if (!player) {
    throw new NotFoundError(`Player ${req.params.id} not found`);
  }

  return player;
}

async function updatePlayer(req) {
  const updatedItem = await playerRepository.updatePlayer(
    req.params.id,
    req.userId,
    item => {
      const { name, teamName, number, position, playsOffense, yearsPlayed } = req.body;

      item.name = name;
      item.teamName = teamName;
      item.number = number;
      item.position = position;
      item.playsOffense = playsOffense;
      item.yearsPlayed = yearsPlayed;
    }
  );

  if (!updatedItem) {
    throw new NotFoundError(`Player not found; id=${req.params.id}`);
  }

  return updatedItem;
}

async function deletePlayer(req) {
  const playerId = req.params.id;

  const count = await playerRepository.deletePlayer(playerId, req.userId);
  if (!count) {
    throw new NotFoundError(`Player not found; id=${req.params.id}`);
  }
}

module.exports = {
  createPlayer,
  readOnePlayer,
  readAllPlayers,
  updatePlayer,
  deletePlayer,
  errorMessages,
};
