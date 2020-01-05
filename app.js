const express = require("express");
const bodyParser = require("body-parser");

let items = [];

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  const today = new Date();

  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  };

  const day = today.toLocaleDateString("en-us", options);

  res.render("list", { kindOfDay: day, newTodos: items });
});

app.post("/", (req, res) => {
  if (!req.body) return res.json("Can not be empty");

  const item = req.body.newTodo;

  items.push(item);

  res.redirect("/");
});

const Port = process.env.PORT || 3000;
app.listen(Port, () => {
  console.log(`now listening on port ${Port}`);
});
