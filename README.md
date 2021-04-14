# Finish Line Server

This project is the API server for the CS2550 MVC projects.

## Setup and Configuration

This server is designed with a minimum no-hassle amount of setup.  To get it running locally, retty much all you have to do is install MongoDB.

### Install MongoDB

This project requires MongoDB version 4 or later. The server will create the `cs2550-mvc` database and initialize all collections.

Install MongoDB with the following options:

1. Configure it to run as a service on port 27017.
2. Create the data directory: `c:\data\db`

The server will connect at the following URL:

```
mongodb://127.0.0.1:27017/cs2550-mvc
```

That's it. This project should take care of everything else for you.

No mess. No fuss. No stress.

## Adding endpoints for a new collection
It's a bottom-up process to add a new collection.  Here is a description of the process, in brief:
1. Create a repository in the `models` folder.
2. Create a service in the `services` folder.
3. Create a controller in the `controllers` folder.
4. Create a route in the `routes` folder.

Once you've done these things, you should be able to test out the new endpoints via Postman.

**Add a repository**

All repository modules live under the `models` folder.  Probably the easiest way to get started is to copy one of the existing files and name it according to the new repository.  The naming convention is `xxxs.model.js`, where `xxxs` is a plural noun.

Define a Mongoos schema for your document collection.  Every schema needs a userId field, which is used to identify all the records for a particular user.  This field is not the same as the _id field, which is the unique id for each document in the collection.  This field should be of type `String`, it should be indexed, and it should be required.  

Define five CRUD functions
* The `createXxx` function takes two parameters: an object and a `userId`.  This function should return a copy of the new record.
* The `readAllXxx` function takes a `userId` and returns all documents that have a matching `userId`.  This function should return an array of objects, or an empty array if there are no records for the current `userId`.
* The `readOneXxx` function takes an id param and a `userId` param.  Make sure you cannot fetch a record that belongs to a different `userId`.  This function should return one document, or null if no document was found.
* The `updateXxx` function takes an id param, a `userId` param, and a callback.  Fetch the record, then pass it to the callback function.  The callback will apply the changes.  This function should return a copy of the updated item, or null if no matching id was found.  Make sure the user can't modify a document belonging to another user.
* The `deleteXxx` function will delete a document.  Make sure the user can't delete a record belonging to another user.  Return a `1` if the record was deleted.  Return a `0` if no matching record was found.

Don't catch any exceptions.  All exceptions will be caught and handled for you by the generic error handler.

**Add a service layer**

Add the five CRUD functions.  The job of the service layer is to take a request object (from express), pull all the data off of it, and pass it to the repository layer.  

Each service function takes one or two parameters:
* `req` This is a request object from express.
* `ctrl` A controller object that can be used to add extra headers.  Right now this object has one method for setting the Location header for `POST` requests.

Don't catch any exceptions.  All exceptions will be caught and handled for you by the generic error handler.

These functions MUST ALWAYS return a value.  If there is a problem with the request, you must throw an exception.  DO NOT RETURN A NULL.

you can throw the following exceptions (there are other error types, but they are handled at different layers):
* `BadRequestError`
* `NotFoundError`

There is no response object.  You set the response by returning data.  If you return nothing, then nothing will be set on the final response object.

**Add a controller**

The controller layer has a schema of its own, which takes care of auto-validating and auto-rejecting data on incoming requests.  Syntax for the schema is similar to Mongoose, but it has its differences, because it's a JSON validator and not document schema, per se.  
* Don't add an `_id` field.  This field should never be part of the request body.
* Don't add a `userId` field.  This field comes from the JWT token (i.e., the bearer token in the `Authorize` header).

The controller layer also has an auto-mapper that filters which properties are available on outgoing responses.  Use the auto-mapper to list any properties you want visible to the user, or to rename any properties.

Each controller is a pipeline of functions.  The pipeline comes in five stages:
1. Input validator: This is called on POST and PUT requests.  This checks the incoming request body against the schema defined in this file.
2. `serviceWrapper`: Use this object to call the servic function for the request type.  The service wrapper's job is to handle all the error handling boilerplate.
3. `handleMongoErrors`: This function catches all MongoDB errors and returns an appropriate response to the user.
4. auto-mapper: If you want to return a single result, call `mapAll.mapScalar`.  If you want to return a list then call `mapAll.mapArray`.
5. Call one of the `xxxResponse` methods from repartee.

**Add a route**

This part is easy.  Just copy an existing route file and make changes.

When you're done, open up index.js and add your new route into the request pipeline.

## Architecture
The following is a top-down description of the architecture for this project.

### index.js
Here we configure express and set up all the routes in the application.

1. Set up connection to MongoDB
2. Set up express boilerplate: 
    * JSON, 
    * the request body parser, 
    * the server port, 
    * a generic error handler
    * CORS
3. enable all the routes.

### routes
Look in the `./routes/` folder.  In `index.js`, I import all the express routers one by one.

I use two libraries that I wrote to automate most of the boilerplate:
* **Repartee**: takes care of serializing responses in a consistent manner.  
* **REST Factory**: takes care of all the boilerplate around creating routes, calling the controllers, and catching exceptions

In the individual route files, I import the controllers one by one and add them to the express pipeline.

### controllers
I use two more libraries that I wrote:
* **Vet**: validates incoming JSON and rejects any requests that do not conform to the schema.  I can do all kinds of custom validation--whatever I need.  The Vet schema ensures that all incoming JSON is whitelisted and sanitized before it is handed off to the controller.
* **AutoMapper**: cherry-picks what goes out to the client, and performs any renaming that might be necessary.

Each controller, per se, is a pipeline of express middleware functions.  The stack looks like this:

1. For POST and PUT requests, a Vet validator
2. A call to the service layer
3. A middleware wrapper I wrote to catch MongoDB errors
4. A call to AutoMapper
5. A call to RestFactory to wrap up the response

### Services
The job of the service layer is to take care of business rules around the individual collections, and to make the appropriate calls to the repository layer.

### models (repositories)
The job of the repository layer is to wrap the individual calls to MongoDB.  There should be no knowledge of MongoDB above the repository layer.

The repository layer uses Mongoose to enforce a MongoDB schema. 
