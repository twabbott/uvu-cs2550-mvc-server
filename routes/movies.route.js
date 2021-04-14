const express = require("express");
const router = express.Router();

const { getAllMovies, getOneMovie, postMovie, putMovie, deleteMovie } = require("../controllers/movies.ctrl");

router.get("/v1/movies", getAllMovies);
router.get("/v1/movies/:id", getOneMovie);
router.post("/v1/movies", postMovie);
router.put("/v1/movies/:id", putMovie);
router.delete("/v1/movies/:id", deleteMovie);

module.exports = router;

