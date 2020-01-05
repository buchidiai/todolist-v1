const express = require("express");
const bodyParser = require("body-parser");
const whichDay = require("./helper/helper");

const app = express();

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  const today = new Date();
  const currentDay = today.getDay();

  const findDay = whichDay(currentDay);

  res.render("list", { kindOfDay: findDay });
});

const Port = process.env.PORT || 3000;
app.listen(Port, () => {
  console.log(`now listening on port ${Port}`);
});
