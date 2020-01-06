const express = require("express");
const bodyParser = require("body-parser");
const day = require("./day");

const items = [];
const workitems = [];

const app = express();

app.use(express.static("public"));

app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("list", {
    listTitle: day,
    newTodos: items
  });
});

app.post("/", (req, res) => {
  if (!req.body) return res.json("Can not be empty");

  console.log(req.body);

  const item = req.body.newTodo;

  if (req.body.list === "Work") {
    workitems.push(item);
    res.redirect("/work");
  } else {
    items.push(item);

    res.redirect("/");
  }
});

app.get("/work", (req, res) => {
  res.render("list", {
    listTitle: "Work List",
    newTodos: workitems
  });
});

const Port = process.env.PORT || 3000;
app.listen(Port, () => {
  console.log(`now listening on port ${Port}`);
});
