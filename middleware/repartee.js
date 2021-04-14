/***** Example code: ***********************************************
 *     const express = require("express");
 *     const app = express();
 *     
 *     const port = 3000;
 *     
 *     const repartee = require("./middleware/repartee");
 *     app.use(repartee.responses());
 *     
 *     app.get('*',  
 *       (req, res, next) => {
 *         // Echo back the query string
 *         res.ok({
 *           query: req.query
 *         });
 *       }
 *     );
 *     
 *     app.listen(port, () => { 
 *       console.log(`Server running on port ${port}`);
 *       console.log(`View at: http://localhost:${port}`);
 *     });
 */


function successPayload(data, message) {
  return {
    success: true,
    data,
    message: message || messages.ok
  };
}

function errorPayload(message, errors) {
  return {
    success: false,
    message,
    errors
  };
}

function wwwAuthenticateChallenge(challengeOptions) {
  if (typeof challengeOptions==="object") {
    if ("scheme" in challengeOptions === false) {
      throw new Error("challengeOptions parameter missing \"scheme\" property.");
    }

    const scheme = challengeOptions.scheme.charAt(0).toUpperCase() + challengeOptions.scheme.slice(1);
    const params = [];
    for (let prop in challengeOptions) {
      if (prop==="scheme") {
        continue;
      }

      const value = challengeOptions[prop];
      switch (typeof value) {
        case "string":
          params.push(`${prop}="${value}"`);  
          break;

        case "number":
        case "boolean":
          params.push(`${prop}=${value}`);  
          break;

        default:
          throw new Error(`Error processing field "${prop}" in challengeOptions.  Value must be string, number, or boolean.`);
      }
    }

    if (!params.length) {
      return scheme;
    }

    return `${scheme} ${params.join(", ")}`;
  } 
  
  if (typeof challengeOptions === "string") {
    return challengeOptions;
  }
  
  throw new Error("Error processing challengeOptions.  Parameter must be an object or a string.");
}

const messages = {
  // 2xx
  ok: "OK",
  created: "Created",

  // 4xx
  badRequest: "Bad request", // 400
  forbidden: "Forbidden", // 401
  unauthorized: "Unauthorized", // 403
  notFound: "Not found", // 404
  methodNotAllowed: "Method not allowed", // 405
  conflict: "Conflict", // 409
  unprocessableentity: "Unprocessable entity", // 422

  // 5xx
  internalServerError: "Internal server error"
};

// Make this a funciton that returns a middleware.  This allows you to 
// someday add config params
function responses() {
  return (req, res, next) => {
    // 200
    res.ok = function(data, message) {
      res
        .status(200)
        .json(successPayload(data, message || messages.ok));
    };

    // 201
    res.created = function(data, id, message) {
      if (id) {
        const uri = `${req.protocol}://${req.headers["host"]}${req.url}/${id}`;
        res
          .set("Location", uri);
      }

      res
        .status(201)
        .json(successPayload(data, message || messages.created));
    };

    // 204
    res.noContent = function() {
      return res 
        .sendStatus(204);
    };

    // 4xx
    res.errorResponse = function(status, message, errors) {
      if (errors && !Array.isArray(errors)) {
        errors = [errors];
      }
      
      return res
        .status(status)
        .json(errorPayload(message, errors));
    };

    // 400
    res.badRequest = function(message, errors) {
      return res.errorResponse(400, message || messages.badRequest, errors);
    };
    
    // 401
    res.unauthorized = function(challengeOptions, message) {
      if (challengeOptions) {
        res.set("WWW-Authenticate", wwwAuthenticateChallenge(challengeOptions));
      }

      return res.errorResponse(401, message || messages.unauthorized);
    };
    
    // 403
    res.forbidden = function(message) {
      return res.errorResponse(403, message || messages.forbidden);
    };
    
    // 404
    res.notFound = function(message) {
      return res.errorResponse(404, message || messages.notFound);
    };
    
    // 405
    res.methodNotAllowed = function(message) {
      return res.errorResponse(405, message || messages.methodNotAllowed);
    };
    
    // 409
    res.conflict = function(message) {
      return res.errorResponse(409, message || messages.conflict);
    };

    // 500
    res.internalServerError = function(message) {
      return res.errorResponse(500, message || messages.internalServerError);
    };

    next();
  };
}

module.exports = {
  responses,
  utilities: {
    successPayload,
    errorPayload,
    wwwAuthenticateChallenge
  },
  defaultMessages: messages
};
