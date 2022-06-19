const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const User = require("./model/user");

const userRouter = require("./routes/user");

app.set("view engine", "ejs");
app.set("views", "views");

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
  User.findById("629f7e70051dfddd6e2079d3")
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => console.log(err));
});

app.use(userRouter);
app.use((req, res) => {
  res.render("404", {
    pageTitle: "404 Not Found",
    path: "404",
  });
});

mongoose
  .connect(
    "mongodb+srv://thaophuongn29:0000@cluster0.s1ubg.mongodb.net/asm1?retryWrites=true&w=majority"
  )
  .then(() => {
    console.log("Connected!");
    app.listen(3000);
  })
  .catch((err) => console.log(err));
