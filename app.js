const express = require("express");
const bodyParser = require("body-parser");

const app = express();

app.get("/", (req, res) => {
  var today = new Date();

  if (today.getDay() === 6 || today.getDay() === 0) {
    res.send("work harder");
  } else {
    res.send("work");
  }
});

const Port = process.env.PORT || 3000;
app.listen(Port, () => {
  console.log(`now listening on port ${Port}`);
});
