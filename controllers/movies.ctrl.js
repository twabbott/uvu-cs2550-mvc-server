const { serviceWrapper, getResponse, postResponse, putResponse, deleteResponse } = require("../middleware/restFactory");
const { createMap } = require("../middleware/automapper");
const regex = require("../shared/regex");
const { handleMongoErrors, validateRequestBody } = require("../middleware/errorHandlers");

const { createMovie, readAllMovies, readOneMovie, updateMovie, deleteMovie, errorMessages } = require("../services/movies.service");

const mpgRatings = new Set(["nr", "g", "pg", "pg-13", "r"]);
const movieGeneres = new Set(["other", "action/adventure", "drama", "comedy", "romance", "sci-fi/fantasy"]);

const movieInfoSchema = {
  title: {
    type: String,
    maxLength: 50,
    required: true
  },
  mpaRating: {
    type: String,
    required: true,
    validate: rating => mpgRatings.has(rating)
  },
  yearProduced: {
    type: String,
    match: regex.fourDigitYear,
    required: true,
    min: 1900,
    max: 2100
  },
  personalRating: {
    type: Number,
    required: false,
    default: 0,
    min: 0,
    max: 5
  },
  genere: {
    type: String,
    validate: genere => movieGeneres.has(genere)
  },
  onBluray: {
    type: Boolean,
    required: false,
    default: false
  }
};

const validateMovieInfo = validateRequestBody(movieInfoSchema);

const mapAll = createMap([
  ["_id", "id"],
  "title",
  "mpaRating",
  "yearProduced",
  "personalRating",
  "genere",
  "onBluray",
  "createdAt",
  "updatedAt"
]);

module.exports = {
  getAllMovies: [
    serviceWrapper.callAsync(readAllMovies),
    handleMongoErrors(errorMessages.read),
    mapAll.mapArray,
    getResponse
  ],
  getOneMovie: [
    serviceWrapper.callAsync(readOneMovie),
    handleMongoErrors(errorMessages.read),
    mapAll.mapScalar,
    getResponse
  ],
  postMovie: [
    validateMovieInfo,
    serviceWrapper.callAsync(createMovie),
    handleMongoErrors(errorMessages.create),
    mapAll.mapScalar,
    postResponse
  ],
  putMovie: [
    validateMovieInfo,
    serviceWrapper.callAsync(updateMovie),
    handleMongoErrors(errorMessages.update),
    mapAll.mapScalar,
    putResponse
  ],
  deleteMovie: [
    serviceWrapper.callAsync(deleteMovie),
    handleMongoErrors(errorMessages.delete),
    deleteResponse
  ]
};
