const express = require("express");
const config = require("./config");
const bodyParser = require("body-parser");
const cors = require("cors");

require("./db");
const routes = require("./routes");

const app = express(express.json());

app.set("port", config.port);

app.use(bodyParser.json());
app.use((err, req, res, next) => { // eslint-disable-line
  console.log(JSON.stringify(err));
  res
    .status(400)
    .json({ 
      success: false,
      message: "Error parsing JSON content",
      errors: [err.message]
    });
});

app.use(cors());

app.use(routes);

app.listen(config.port, () => { 
  console.log(`Server running on port ${config.port}`);
  console.log(`View server status at: http://localhost:${config.port}`);
});
