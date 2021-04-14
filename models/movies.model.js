const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    userId: {
      type: String,
      indexed: true,
      required: true
    },
    title: {
      type: String,
      trim: true,
      required: true
    },
    mpaRating: {
      type: String,
      required: true,
      maxlength: 5,
      lowercase: true,
    },
    yearProduced: {
      type: Number,
      required: true,
    },
    personalRating: {
      type: Number,
      default: 0,
    },
    genere: {
      type: String,
      default: "other",
      lowercase: true,
    },
    onBluray: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  },
);

const movieSchema = mongoose.model("movies", schema);

const movieRepository = {
  createMovie: async(movie, userId) => {
    movie.userId = userId;
    const doc = new movieSchema(movie);
    return await doc.save();
  },

  readAllMovies: async(userId) => {
    return await movieSchema.find({ userId });
  },

  readOneMovie: async (movieId, userId) => {
    return await movieSchema.findOne({ _id: movieId, userId});
  },

  updateMovie: async (movieId, userId, callback) => {
    const item = await movieRepository.readOneMovie(movieId, userId);
    if (!item) {
      return null;
    }

    callback(item);

    await item.save();

    return item;
  },

  deleteMovie: async (movieId, userId) => {
    const result = await movieSchema.deleteOne({ _id: movieId, userId });
    return (result && result.deletedCount) || 0;
  }
};

module.exports = {
  movieSchema,
  movieRepository
};
