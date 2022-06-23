const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const User = require("./model/user");
const Manager = require("./model/manager");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const multer = require("multer");
const path = require("path");

// Router
const userRouter = require("./routes/user");
const authRouter = require("./routes/auth");
const managerRouter = require("./routes/manager");

const MONGODB_URI =
  "mongodb+srv://thaophuongn29:0000@cluster0.s1ubg.mongodb.net/asm1?retryWrites=true&w=majority";

app.set("view engine", "ejs");
app.set("views", "views");

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// file tinh
app.use("/images", express.static(path.join(__dirname, "images")));

// Thiet lap post file hinh anh
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + "-" + file.originalname);
  },
});
app.use(multer({ storage: fileStorage }).single("image"));

// Thiet lap session voi MongoDB
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: "sessions",
});

app.use(
  session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    store,
  })
);

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  next();
});

// Xac thuc nguoi dung
app.use((req, res, next) => {
  if (req.session.isLoggedIn) {
    // nhan vien dang nhap
    if (req.session.isLoggedIn.user) {
      User.findById(req.session.user._id)
        .then((user) => {
          req.user = user;
          next();
        })
        .catch((err) => next(err));
      // quan li dang nhap
    } else if (req.session.isLoggedIn.manager) {
      Manager.findById(req.session.user._id)
        .then((user) => {
          req.user = user;
          next();
        })
        .catch((err) => next(err));
    }
  } else {
    next();
  }
});

app.use(userRouter);
app.use(authRouter);
app.use(managerRouter);

app.use((req, res) => {
  res.render("404", {
    pageTitle: "404 Not Found",
    path: "404",
  });
});

app.use((error, req, res, next) => {
  console.log(error);
  res.status(500).render("500", {
    pageTitle: "Error",
    path: "/500",
  });
});

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("Connected!");
    // app.listen(process.env.PORT || 8080, "0.0.0.0", () => {
    //   console.log("Server is running!");
    // });
    app.listen(3000);
  })
  .catch((err) => console.log(err));
