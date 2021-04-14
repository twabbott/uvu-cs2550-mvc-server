const logger = require("morgan");
const path = require("path");

const express = require("express");
const router = express.Router();

// const charactersRouter = require("./characters.route");
const charactersRouter = require("./characters.route");
const moviesRouter = require("./movies.route");
const playersRouter = require("./players.route");
const studentsRouter = require("./students.route");

const { validateToken } = require("../middleware/auth");

// Repartee config
const { responses } = require("../middleware/repartee");
router.use(responses());

// restFactory config
const restFactory = require("../middleware/restFactory");
restFactory.init({
  errorLogger: err => console.trace(err),
  traceOn: true
});

// Add all public routes (there are none, this is an example)
//router.use(authRouter);

// All API routes
router.use(
  "/api",
  logger("dev"),
  validateToken, // This validates the GUID

  // Add all routers here
  charactersRouter,
  moviesRouter,
  playersRouter,
  studentsRouter
);

// All static routes
router.use(express.static(path.join(__dirname, "public")));

// Catch-all error handlers
router.use(
  function(req, res) {
    res.notFound();
  },
  restFactory.handleErrors
);

module.exports = router;
