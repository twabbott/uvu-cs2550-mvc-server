const { characterRepository } = require("../models/characters.model");

const { NotFoundError, BadRequestError } = require("../middleware/restFactory");

const errorMessages = {
  create: "Error creating new character.",
  read: "Error reading character(s).",
  update: "Error updating character.",
  delete: "Error deleting character"
};

async function createCharacter(req, ctrl) {
  const {
    name,
    race,
    gender,
    isRightHanded,
    strength,
    dexterity,
    constitution,
    intelligence,
    wisdom,
    charisma
  } = req.body;

  const all = await characterRepository.readAllCharacters(req.userId);
  if (all.length >= 20) {
    throw new BadRequestError("Cannot have more than 20 characters.");
  }

  let character = await characterRepository.createCharacter({
    name,
    race,
    "class": req.body.class,
    gender,
    isRightHanded,
    strength,
    dexterity,
    constitution,
    intelligence,
    wisdom,
    charisma
  }, req.userId);

  // Give a location ID for the header
  ctrl.setLocationId(character._id.toString());

  return character;
}

async function readAllCharacters(req) {
  return await characterRepository.readAllCharacters(req.userId);
}

async function readOneCharacter(req) {
  const characterId = req.params.id;

  const character = await characterRepository.readOneCharacter(characterId, req.userId);
  if (!character) {
    throw new NotFoundError(`Character ${req.params.id} not found`);
  }

  return character;
}

async function updateCharacter(req) {
  const updatedItem = await characterRepository.updateCharacter(
    req.params.id,
    req.userId,
    item => {
      item.name = req.body.name;
      item.race = req.body.race;
      item.class = req.body.class;
      item.gender = req.body.gender;
      item.isRightHanded = req.body.isRightHanded;
      item.strength = req.body.strength;
      item.dexterity = req.body.dexterity;
      item.constitution = req.body.constitution;
      item.intelligence = req.body.intelligence;
      item.wisdom = req.body.wisdom;
      item.charisma = req.body.charisma;
    }
  );

  if (!updatedItem) {
    throw new NotFoundError(`Character not found; id=${req.params.id}`);
  }

  return updatedItem;
}

async function deleteCharacter(req) {
  const characterId = req.params.id;

  const count = await characterRepository.deleteCharacter(characterId, req.userId);
  if (!count) {
    throw new NotFoundError(`Character not found; id=${req.params.id}`);
  }
}

module.exports = {
  createCharacter,
  readOneCharacter,
  readAllCharacters,
  updateCharacter,
  deleteCharacter,
  errorMessages,
};
