

let logError = err => {};  // eslint-disable-line
let tracing = false;

/* Call this function to configure global options for restFactory.
 */
function init({ errorLogger = undefined, traceOn = false } = {}) {
  logError = errorLogger || logError;
  tracing = traceOn;
}

function trace(name, message) {
  if (tracing) {
    console.log("restFactory: " + message);
  }
}

/* serviceWrapper
 *     Use this function to wrap an async call to a service and generate a middleware.
 *       - If your service is successful, it shouild set result.data (and  
 *         optionally result.message or result.id).
 *       - If an item is not found, throw a NotFoundError
 *       - If there is an error in the data and the request cannot be processed, 
 *         throw an BadRequestError.
 *       - If there is a permissions problem, throw a ForbiddenError.
 *       - Do not catch any unexpected exceptions.  Let restFactory handle them.
 */
const serviceWrapper = {
  callAsync(service) {
    if (service.constructor.name !== "AsyncFunction") {
      throw new Error("serviceWrapper.callAsync() must take an async function");
    }

    return async function (req, res, next) {
      trace("restFactory", "callAsync - begin");

      const controller = {
        setLocationId(id) {
          res.locals.locationId = id;
        },
        setLocation(url) {
          res.locals.url = url;
        },
        setMessage(message) {
          res.locals.message = message;
        }
      };

      try {
        const data = await service(req, controller);

        trace("restFactory", "callAsync - service returned successfully");
        if (data !== undefined) {
          res.locals.data = data;
        }

        trace("restFactory", "callAsync - end, success");
        next();
      } catch (err) {
        if (err instanceof RequestError) {
          trace("restFactory", "callAsync - caught a RequestError");
        } else if (err instanceof BadRequestError) {
          trace("restFactory", "callAsync - caught a BadRequestError");
        } else if (err instanceof UnauthorizedError) {
          trace("restFactory", "callAsync - caught a UnauthorizedError");
        } else if (err instanceof ForbiddenError) {
          trace("restFactory", "callAsync - caught a ForbiddenError");
        } else if (err instanceof NotFoundError) {
          trace("restFactory", "callAsync - caught a NotFoundError");
        } else {
          trace("restFactory", "callAsync - caught an unknown exception");
        }

        next(err);
      }
    };
  },

  call(service) {
    if (service.constructor.name === "AsyncFunction") {
      throw new Error("serviceWrapper.call() can not take an async function");
    }

    return function (req, res, next) {
      trace("restFactory", "serviceWrapper - begin");

      const controller = {
        setLocationId(id) {
          res.locals.locationId = id;
        },
        setLocation(url) {
          res.locals.url = url;
        },
        setMessage(message) {
          res.locals.message = message;
        }
      };

      try {
        const data = service(req, controller);

        trace("restFactory", "serviceWrapper - service returned successfully");
        if (data !== undefined) {
          res.locals.data = data;
        }

        trace("restFactory", "serviceWrapper - end (calling next)");
        next();
      } catch (err) {
        trace("restFactory", "serviceWrapper - caught an exception");
        next(err);
      }
    };
  }
};

/* handleOK()
 *     This middleware relies on the previous middleware in the chain performing the 
 *     following:
 *     - If the request yields results, it should set res.locals.data to 
 *       something besides null.
 *     - If the parameters for the request are invalid (400 bad request), set res.locals.errors
 *       to an array of one or more strings.
 *     - If the request is yields zero results (404 not found), set res.locals.
 *       result to null (or leave it unmodified, since its default value is null).
 *     - For any fatal errors, either throw an exception or call next(err), whichever you 
 *       like.
 * 
 *   This middleware relies on validation happening earlier in the pipeline.  The body
 *   and all params should be validated BEFORE this middleware is invoked. 
 */
function handleOK(req, res, next) { // eslint-disable-line
  trace("restFactory", "handleOK - 200");
  res
    .status(200)
    .json({
      success: true,
      message: res.locals.message || "OK",
      data: res.locals.data
    });
}

/* handleCreated()
 *   This middleware relies on the previous middleware in the chain performing the 
 *   following:
 *     - If the request yields results, it should set res.locals.data
 *     - If the parameters for the request are invalid (400 bad request), set res.locals.errors
 *       to an array of one or more strings.
 *     - To auto-set a Location header, set res.locals.id to any number or string.  If 
 *       you want to suppress generating the Location header, res.locals.id as undefined.
 *     - For any fatal errors, either throw an exception or call next(err), whichever you 
 *       like.
 * 
 *   This middleware relies on validation happening earlier in the pipeline.  The body
 *   and all params should be validated BEFORE this middleware is invoked. 
 */
function handleCreated(req, res, next) { // eslint-disable-line
  let url = undefined;
  if (typeof res.locals.locationId === "number" || typeof res.locals.locationId === "string") {
    url = `${req.protocol}://${req.headers["host"]}${req.url}/${res.locals.locationId}`;
  } else if (typeof res.locals.url === "string") {
    url = res.locals.url;
  }

  if (url) {
    trace("restFactory", "handleCreated - 201, Location=" + url);
    res.set("Location", url);
  } else {
    trace("restFactory", "handleCreated - 201");
  }

  res
    .status(201)
    .json({
      success: true,
      message: res.locals.message || "Created",
      data: res.locals.data
    });
}

/** Causes a 400 Bad Request to be sent to the client.  Use this error when validating 
 * request data before processing it.  This exception type allows you to include an array
 * containing error info (strings, or whatever format you like). 
 * @param {string} message - A title indicating the operation that the user was trying to perform.
 * @param {number} statusCode - HTTP status code you want to send.
 * @param {string} errors - An array of one or more errors describing validation errors for the user to fix.
 */
class RequestError extends Error {
  constructor(message, statusCode = 400, errors = undefined, fileName, lineNumber) {
    super(message, fileName, lineNumber);    
    Error.captureStackTrace(this, RequestError);

    this.statusCode = statusCode;
    this.errors = errors;
  }
}

/** Causes a 400 Bad Request to be sent to the client
 * @param {string} message - A title indicating the operation that the user was trying to perform.
 * @param {string} description - Specific details about what went wrong, so the user can fix the problem.
 */
class BadRequestError extends Error {
  constructor(message, description, fileName, lineNumber) {
    super(message, fileName, lineNumber);    
    Error.captureStackTrace(this, BadRequestError);

    this.errors = description && [ description ];
  }
}

/** Causes a 401 Not Authorized to be sent to the client
 * @param {string} message - Any details you want to provide (usually not needed).
 * @param {Object} challenge - An object containing challenge info (e.g.: { scheme: "Bearer", realm: "My website" }).
 */
class UnauthorizedError extends Error {
  constructor(message, challenge, ...errorArgs) {
    super(message, ...errorArgs);
    Error.captureStackTrace(this, UnauthorizedError);

    if (challenge) {
      try {
        this.challengeOptions = wwwAuthenticateChallenge(challenge);
      } catch (err) {
        logError(err);
      }      
    }
  }
}

/** Causes a 403 Forbidden to be sent to the client
 * @param {string} message - Provide any explanation you think they ought to know
 */
class ForbiddenError extends Error {
  constructor(...errorArgs) {
    super(...errorArgs);
    Error.captureStackTrace(this, ForbiddenError);
  }
}


/** Causes a 403 Forbidden to be sent to the client
 * @param {string} message - Provide any explanation you think they ought to know
 */
class NotFoundError extends Error {
  constructor(...errorArgs) {
    super(...errorArgs);
    Error.captureStackTrace(this, NotFoundError);
  }
}

/** This middleware gets called at the end of your request pipeline.  Its purpose 
 * is to catch any errors that get thrown.  If it catches one of the response errors
 * (BadRequestError, NotFoundError, etc) it will respond with a 4xx.  Otherwise, it will
 * log an exception stack trace and return a 500.
 */
function handleErrors(err, req, res, next) { // eslint-disable-line
  if (err instanceof RequestError) {
    trace(`handleErrors - ${err.statusCode} (RequestError)`);
    return res
      .status(err.statusCode || 400)
      .json({
        success: false,
        message: err.message || "Bad request",
        errors: (Array.isArray(err.errors) && err.errors) || (err.errors && [err.errors]) || undefined
      });
  }

  if (err instanceof BadRequestError) {
    trace("restFactory", "handleErrors - 400 (BadRequestError)");
    return res
      .status(400)
      .json({
        success: false,
        message: err.message || "Bad request",
        errors: err.errors
      });
  }

  if (err instanceof UnauthorizedError) {
    trace("restFactory", "handleErrors - 401");
    if (err.challengeOptions) {
      res.set("WWW-Authenticate", err.challengeOptions);
    }
  
    return res
      .status(401)
      .json({
        success: false,
        message: err.message || "Unauthorized"
      });
  }

  if (err instanceof ForbiddenError) {
    trace("restFactory", "handleErrors - 403");
    return res
      .status(403)
      .json({
        success: false,
        message: err.message || "Forbidden"
      });
  }

  if (err instanceof NotFoundError) {
    trace("restFactory", "handleErrors - 404");
    return res
      .status(404)
      .json({
        success: false,
        message: err.message || "Not found"
      });
  }

  trace("restFactory", "handleErrors - 500");
  logError(err);
  return res
    .status(500)
    .json({
      success: false,
      message: err.message || "Internal server error"
    });
}

/** Creates a challenge object for a WWW-Authenticate header.  For use when throwing an UnauthorizedError 
 * @param {string} scheme - The scheme to use.  Common types are "Bearer", or "Digest"
 * @param {string} realm - A description of the protected area. If no realm is specified, clients often display a formatted hostname instead.
 * @param {Object} options - An options object containing any other props you want to set.  Acceptable data types are string, number, or boolean.
*/
function challengeOptions(scheme = "Bearer", realm = undefined, options = undefined) {
  const challenge = {
    scheme: scheme.charAt(0).toUpperCase() + scheme.substring(1),
  };

  if (realm) {
    challenge.realm = realm;
  }

  if (typeof options === "object") {
    return {
      ...challenge,
      ...options
    };
  }

  return challenge;
}

function wwwAuthenticateChallenge(challengeOptions) {
  if (typeof challengeOptions==="object") {
    if (!challengeOptions.scheme) {
      throw new Error("UnauthorizedError has error in challenge object: missing \"scheme\" property.");
    }

    const scheme = challengeOptions.scheme.charAt(0).toUpperCase() + challengeOptions.scheme.slice(1);
    const params = [];
    for (let prop in challengeOptions) {
      if (prop==="scheme") {
        if (challengeOptions.scheme === "bearer") {
          challengeOptions.scheme = "Bearer";
        }
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
          throw new Error(`UnauthorizedError has error in challenge object: field "${prop}" in challengeOptions must be string, number, or boolean.`);
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

module.exports = {
  init,
  serviceWrapper,
  RequestError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  challengeOptions,
  getResponse: [    
    handleOK,
    handleErrors
  ],
  postResponse: [
    handleCreated,
    handleErrors
  ],
  putResponse: [    
    handleOK,
    handleErrors
  ],
  deleteResponse: [    
    handleOK,
    handleErrors
  ],
  trace,
  handleErrors
};
