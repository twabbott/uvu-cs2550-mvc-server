const { movieRepository } = require("../models/movies.model");

const { NotFoundError, BadRequestError } = require("../middleware/restFactory");

const errorMessages = {
  create: "Error creating new movie.",
  read: "Error reading movie(s).",
  update: "Error updating movie.",
  delete: "Error deleting movie"
};

async function createMovie(req, ctrl) {
  const { title, mpaRating, yearProduced, personalRating, genere, onBluray } = req.body;

  const all = await movieRepository.readAllMovies(req.userId);
  if (all.length >= 20) {
    throw new BadRequestError("Cannot have more than 20 movies.");
  }

  let movie = await movieRepository.createMovie({
    title,
    mpaRating,
    yearProduced,
    personalRating,
    genere,
    onBluray
  }, req.userId);

  // Give a location ID for the header
  ctrl.setLocationId(movie._id.toString());

  return movie;
}

async function readAllMovies(req) {
  return await movieRepository.readAllMovies(req.userId);
}

async function readOneMovie(req) {
  const movieId = req.params.id;

  const movie = await movieRepository.readOneMovie(movieId, req.userId);
  if (!movie) {
    throw new NotFoundError(`Movie ${req.params.id} not found`);
  }

  return movie;
}

async function updateMovie(req) {
  const updatedItem = await movieRepository.updateMovie(
    req.params.id,
    req.userId,
    item => {
      const { title, mpaRating, yearProduced, personalRating, genere, onBluray } = req.body;

      item.title = title;
      item.mpaRating = mpaRating;
      item.yearProduced = yearProduced;
      item.personalRating = personalRating;
      item.genere = genere;
      item.onBluray = onBluray;
    }
  );

  if (!updatedItem) {
    throw new NotFoundError(`Movie not found; id=${req.params.id}`);
  }

  return updatedItem;
}

async function deleteMovie(req) {
  const movieId = req.params.id;

  const count = await movieRepository.deleteMovie(movieId, req.userId);
  if (!count) {
    throw new NotFoundError(`Movie not found; id=${req.params.id}`);
  }
}

module.exports = {
  createMovie,
  readOneMovie,
  readAllMovies,
  updateMovie,
  deleteMovie,
  errorMessages,
};
