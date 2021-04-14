const { serviceWrapper, getResponse, postResponse, putResponse, deleteResponse } = require("../middleware/restFactory");
const { createMap } = require("../middleware/automapper");
const { handleMongoErrors, validateRequestBody } = require("../middleware/errorHandlers");

const { createCharacter, readAllCharacters, readOneCharacter, updateCharacter, deleteCharacter, errorMessages } = require("../services/characters.service");

const characterInfoSchema = {
  name: {
    type: String,
    maxlength: 50,
    trim: true,
    required: true
  },
  race: {
    type: String,
    maxlength: 20,
    trim: true,
    required: true
  },
  class: {
    type: String,
    maxlength: 20,
    trim: true,
    required: true
  },
  gender: {
    type: String,
    required: true,
    maxLength: 6,
    validate: gender => gender === "male" || gender === "female"
  },
  isRightHanded: {
    type: Boolean,
    default: false
  },
  strength: {
    type: Number,
    required: true,
    min: 3,
    max: 18
  },
  dexterity: {
    type: Number,
    required: true,
    min: 3,
    max: 18
  },
  constitution: {
    type: Number,
    required: true,
    min: 3,
    max: 18
  },
  intelligence: {
    type: Number,
    required: true,
    min: 3,
    max: 18
  },
  wisdom: {
    type: Number,
    required: true,
    min: 3,
    max: 18
  },
  charisma: {
    type: Number,
    required: true,
    min: 3,
    max: 18
  },
};

const validateCharacterInfo = validateRequestBody(characterInfoSchema);

const mapAll = createMap([
  ["_id", "id"],
  "name",
  "race",
  "class",
  "gender",
  "isRightHanded",
  "strength",
  "dexterity",
  "constitution",
  "intelligence",
  "wisdom",
  "charisma",
  "createdAt",
  "updatedAt"
]);

module.exports = {
  getAllCharacters: [
    serviceWrapper.callAsync(readAllCharacters),
    handleMongoErrors(errorMessages.read),
    mapAll.mapArray,
    getResponse
  ],
  getOneCharacter: [
    serviceWrapper.callAsync(readOneCharacter),
    handleMongoErrors(errorMessages.read),
    mapAll.mapScalar,
    getResponse
  ],
  postCharacter: [
    validateCharacterInfo,
    serviceWrapper.callAsync(createCharacter),
    handleMongoErrors(errorMessages.create),
    mapAll.mapScalar,
    postResponse
  ],
  putCharacter: [
    validateCharacterInfo,
    serviceWrapper.callAsync(updateCharacter),
    handleMongoErrors(errorMessages.update),
    mapAll.mapScalar,
    putResponse
  ],
  deleteCharacter: [
    serviceWrapper.callAsync(deleteCharacter),
    handleMongoErrors(errorMessages.delete),
    deleteResponse
  ]
};
