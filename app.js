const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const { mongoURI } = require("./config/keys");

const app = express();

app.use(express.static("public"));

app.use(
  bodyParser.urlencoded({
    extended: true,
    useUnifiedTopology: true
  })
);
app.set("view engine", "ejs");

console.log(mongoURI, "mongoURI");

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
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
  //get all items from db
  Item.find({}).then(response => {
    if (response.length === 0) {
      //if array length is 0, insert default into db
      //then redirect
      Item.insertMany(defaultItems)
        .then(() => {
          console.log(`saved default items to db`);
          res.redirect("/");
        })
        .catch(() => console.log("error saving default"));
    } else {
      //if rayy is not === 0
      //render items
      res.render("list", {
        listTitle: "Today",
        newTodos: response
      });
    }
  });
});

app.get("/:list", (req, res) => {
  const listName = _.capitalize(req.params.list);
  //find list based on url params entered
  List.findOne({ name: listName }).then(result => {
    if (result === null) {
      //create new list
      //list doesnt exisit

      const list = new List({
        name: listName,
        items: defaultItems
      });
      list
        .save()
        .then(r => {
          console.log("saved " + listName);
          res.redirect("/" + listName);
        })
        .catch(err => {
          console.log("errors");
        });
    } else {
      //show existing list
      //render array items in list.ejs

      res.render("list", {
        listTitle: result.name,
        newTodos: result.items
      });
    }
  });
});

app.post("/", (req, res) => {
  //check if body is empty
  if (!req.body || !req.body.newTodo || !req.body.list)
    return res.json("Can not be empty");

  const item = _.capitalize(req.body.newTodo);
  const listName = _.capitalize(req.body.list);
  //create new item object
  const todo = new Item({
    name: item
  });

  if (listName === "Today") {
    //save item from main page to db

    todo
      .save()
      .then(() => {
        console.log("saved " + item);
      })
      .catch(() => console.log("error saving todo items "));

    res.redirect("/");
  } else {
    //save item from custom url param
    //when item is added from custom list w/ param handle
    //find object from db
    //push new item into array of items from listSchema
    //save to db

    List.findOne({ name: listName })
      .then(result => {
        result.items.push(todo);
        result.save();
        console.log("saved " + todo + " from custom list ");

        res.redirect("/" + listName);
        console.log("redirected / refreshed ");
      })
      .catch(err => {
        console.log("error" + err);
      });
  }
});

app.post("/delete", (req, res) => {
  const checkedItem = req.body.checkbox;
  const listName = req.body.listName;

  //remove item from db via id
  //redirect

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItem)
      .then(result => {
        console.log("item was deleted");

        res.redirect("/");
      })
      .catch(err => {
        console.log(err);
      });
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkedItem } } }
    )
      .then(result => {
        if (result) {
          res.redirect("/" + listName);
        }
      })
      .catch(err => {});
  }
});

const Port = process.env.PORT || 3000;
app.listen(Port, () => {
  console.log(`now listening on port ${Port}`);
});
