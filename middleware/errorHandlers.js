const mongoose = require("mongoose");
const { RequestError, BadRequestError, trace } = require("../middleware/restFactory");
const { checkSchemaDefinition, validateObjectProperties } = require("./vet");

/** Middleware to handle MongoDB / Mongoose errors and return a 400 error to the 
 *  client.  This function will detect any known exceptions, and re-throw them as 
 *  an BadRequestError, which restFactory will capture and return as a 400 error to the client.
 * 
 * @param {string} message - A genreal error title message describing the operation being performed (e.g.: "Error reading user"). 
 */
function handleMongoErrors(message = "Unable to process request") {
  return (err, req, res, next) => {
    let description = null;
    if (err.name === "MongoError") {
      switch (err.code) {
        case 11000:
          trace("handleMongoErrors", "MongoError(11000) - unique constraint violation.");
          description = `The following prop/value must be unique: ${JSON.stringify(err.keyValue)}`;
          break;

        default:
          trace("handleMongoErrors", "MongoError(unknown): " + JSON.stringify(err, null, 2));
          description = "There was an error in the data for this request.";
          break;
      }
    }

    if (err instanceof mongoose.Error) {
      switch (err.name) {
        case "CastError":
          trace("handleMongoErrors", "MongooseError(CastError) " + JSON.stringify(err, null, 2));
          description = `Value ${err.stringValue} must be a valid ${err.kind}.`;
          break;

        case "ValidationError":
          trace("handleMongoErrors", "MongooseError(ValidationError) " + JSON.stringify(err, null, 2));
          description = err.message;
          break;
    
        default:
          trace("handleMongoErrors", "MongooseError(unknown): " + JSON.stringify(err, null, 2));
          description = "There was an error in the data for this request.";
      }
    }

    if (description) {
      throw new BadRequestError(message, description);
    }

    next(err);
  };
}

function validateRequestBody(schema) {
  checkSchemaDefinition(schema);

  function middleware(req, res, next) {
    if (typeof req.body !== "object") {
      throw new BadRequestError("Request payload must be a JSON object");
    }

    const result = validateObjectProperties(schema, req.body);
    
    if (result.errors.length === 0) {
      Object.assign(req.body, result.value);
    } else {
      throw new RequestError("Validation error", 400, result.errors);
    }

    next();
  }

  return middleware;
}

module.exports = {
  validateRequestBody,
  handleMongoErrors,
};