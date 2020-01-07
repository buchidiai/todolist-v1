const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

app.use(express.static("public"));

app.use(
  bodyParser.urlencoded({
    extended: true,
    useUnifiedTopology: true
  })
);
app.set("view engine", "ejs");

mongoose.connect("mongodb://localhost:27017/todolistDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: true
});

const itemSchema = new mongoose.Schema({
  name: String
});

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema]
});

const Item = mongoose.model("Item", itemSchema);
const List = mongoose.model("List", listSchema);

const saveDefault = (message, model) => {
  return new model({
    name: message
  });
};

const defaultItems = [
  saveDefault("Type an item", Item),
  saveDefault("Hit + to add an item", Item),
  saveDefault("Then go crazy", Item)
];

app.get("/", (req, res) => {
  Item.find({}).then(response => {
    if (response.length === 0) {
      Item.insertMany(defaultItems)
        .then(() => {
          console.log(`saved default to db`);
          res.redirect("/");
        })
        .catch(() => console.log("error saving default"));
    } else {
      res.render("list", {
        listTitle: "Today",
        newTodos: response
      });
    }
  });
});

app.get("/:list", (req, res) => {
  const listName = req.params.list;

  List.find({ name: listName }).then(result => {
    if (!result) {
      //create new list
      console.log(result, "result not");

      const list = new List({
        name: listName,
        items: defaultItems
      });
      list
        .save()
        .then(r => {
          console.log("saved " + listName);

          console.log("response from new list " + r);

          res.redirect("/" + listName);
        })
        .catch(err => {
          console.log("erros");
        });
    } else {
      //show existing list
      console.log(result, "true");

      res.render("list", {
        listTitle: listName,
        newTodos: result
      });
    }
  });
});

app.post("/", (req, res) => {
  if (!req.body || !req.body.newTodo || !req.body.list)
    return res.json("Can not be empty");

  const item = req.body.newTodo;

  if (req.body.list === "Work") {
    const work = new Work({
      name: item
    });

    work
      .save()
      .then(() => {
        console.log("saved " + item);
        res.redirect("/work");
      })
      .catch(() => console.log("error saving work item"));
  } else {
    const todo = new Item({
      name: item
    });

    todo
      .save()
      .then(() => {
        console.log("saved " + item);
      })
      .catch(() => console.log("error saving todo items "));

    res.redirect("/");
  }
});

app.post("/delete", (req, res) => {
  const checkedItem = req.body.checkbox;

  Item.findByIdAndRemove(checkedItem)
    .then(result => {
      console.log("item was deleted");

      res.redirect("/");
    })
    .catch(err => {
      console.log(err);
    });
});

const Port = process.env.PORT || 3000;
app.listen(Port, () => {
  console.log(`now listening on port ${Port}`);
});
