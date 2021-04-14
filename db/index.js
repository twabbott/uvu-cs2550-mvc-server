const config = require("../config");
const mongoose = require("mongoose");

const connectionOptions = { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
};

// NOTE: Mongoose connections are asynchronous, and you do not have to be
// connected before continuing.
mongoose.connect(config.dbConnectionUrl, connectionOptions)
  .then(() => console.log(`MongoDB connected at ${config.dbConnectionUrl}`))
  .catch(e => console.error("Connection error: ", e.message));

mongoose.connection.on("error", console.error.bind(console, "MongoDB connection error:"));

module.exports = mongoose.connection;
