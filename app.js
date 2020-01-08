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
  //get all items from db
  Item.find({}).then(response => {
    if (response.length === 0) {
      //if array length is 0, insert default into db
      //then redirect
      Item.insertMany(defaultItems)
        .then(() => {
          console.log(`saved default to db`);
          res.redirect("/");
        })
        .catch(() => console.log("error saving default"));
    } else {
      //if rayy is not 0
      //render items
      res.render("list", {
        listTitle: "Today",
        newTodos: response
      });
    }
  });
});

app.get("/:list", (req, res) => {
  const listName = req.params.list;
  //find list based on params entered
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
          console.log("erros");
        });
    } else {
      //show existing list
      //show array items

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

  const item = req.body.newTodo;
  const listName = req.body.list;
  //create new item object
  const todo = new Item({
    name: item
  });

  console.log(listName, "listName");

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
    //when item is added from custom list w/ param handle
    //find object from db
    //push new item into array of items from listSchema
    //save to db

    List.findOne({ name: listName })
      .then(result => {
        console.log(result, "result from custom param");

        console.log("push");
        result.items.push(todo);
        result.save();
        res.redirect("/" + listName);

        // if (!result) {
        //   //create new list
        //   console.log("create");
        // } else {
        //   //push to list

        // }
      })
      .catch(err => {
        console.log("error" + err);
      });
  }
});

app.post("/delete", (req, res) => {
  const checkedItem = req.body.checkbox;

  //remove item from db via id
  //redirect

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
