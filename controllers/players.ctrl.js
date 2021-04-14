const { serviceWrapper, getResponse, postResponse, putResponse, deleteResponse } = require("../middleware/restFactory");
const { createMap } = require("../middleware/automapper");
const { handleMongoErrors, validateRequestBody } = require("../middleware/errorHandlers");

const { createPlayer, readAllPlayers, readOnePlayer, updatePlayer, deletePlayer, errorMessages } = require("../services/players.service");

const playerInfoSchema = {
  name: {
    type: String,
    maxLength: 50,
    required: true
  },
  teamName: {
    type: String,
    maxLength: 50,
    required: true,
  },
  number: {
    type: Number,
    required: true,
    min: 0,
    max: 99
  },
  position: {
    type: String,
    maxLength: 50,
    required: true,
  },
  playsOffense: {
    type: Boolean,
    required: false,
    default: false
  },
  yearsPlayed: {
    type: Number,
    min: 0,
    max: 50
  },
};

const validatePlayerInfo = validateRequestBody(playerInfoSchema);

const mapAll = createMap([
  ["_id", "id"],
  "name",
  "teamName",
  "number",
  "position",
  "playsOffense",
  "yearsPlayed",
  "createdAt",
  "updatedAt"
]);

module.exports = {
  getAllPlayers: [
    serviceWrapper.callAsync(readAllPlayers),
    handleMongoErrors(errorMessages.read),
    mapAll.mapArray,
    getResponse
  ],
  getOnePlayer: [
    serviceWrapper.callAsync(readOnePlayer),
    handleMongoErrors(errorMessages.read),
    mapAll.mapScalar,
    getResponse
  ],
  postPlayer: [
    validatePlayerInfo,
    serviceWrapper.callAsync(createPlayer),
    handleMongoErrors(errorMessages.create),
    mapAll.mapScalar,
    postResponse
  ],
  putPlayer: [
    validatePlayerInfo,
    serviceWrapper.callAsync(updatePlayer),
    handleMongoErrors(errorMessages.update),
    mapAll.mapScalar,
    putResponse
  ],
  deletePlayer: [
    serviceWrapper.callAsync(deletePlayer),
    handleMongoErrors(errorMessages.delete),
    deleteResponse
  ]
};
