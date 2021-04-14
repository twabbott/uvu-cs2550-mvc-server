const express = require("express");
const app = express();

const bodyParser = require("body-parser");
app.use(bodyParser.json());

const port = 3000;

const repartee = require("./middleware/repartee");
app.use(repartee.responses());


app.post("*",
  (req, res) => {
    let data = {};
    for (let key in req.body) {
      data[key] = typeof req.body[key];
    }

    // Echo back the query string
    res.ok(data);
  }
);

app.listen(port, () => { 
  console.log(`Server running on port ${port}`);
  console.log(`View at: http://localhost:${port}`);
});
