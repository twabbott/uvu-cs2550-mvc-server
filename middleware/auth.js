const { UnauthorizedError, challengeOptions, handleErrors } = require("../middleware/restFactory");
const regex = require("../shared/regex");

const challenge = challengeOptions("Bearer", "Finish line");

function isGuid(str) {
  return !!str.match(regex.guid);
}

function validateToken(req, res, next) {
  // get the token from the header if present
  let token = req.headers["authorization"];

  // if no token found, return response (without going to the next middelware)
  if (!token) {
    throw new UnauthorizedError("User not authenticated.", challenge);
  }

  // Remove "Bearer" from string
  if (!isGuid(token)) {
    throw new UnauthorizedError("Invalid bearer token.", challenge);
  }

  // Set the GUID as a userId
  req.userId = token.slice(7, token.length).toLowerCase();

  next();
}

module.exports = {
  challengeOptions: challenge,
  validateToken: [
    validateToken,
    handleErrors
  ]
};
