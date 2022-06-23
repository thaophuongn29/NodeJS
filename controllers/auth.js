const User = require("../model/user");
const Manager = require("../model/manager");

exports.getLogin = (req, res) => {
  if (req.session.isLoggedIn) {
    return res.redirect("/covid");
  }
  res.render("auth", {
    pageTitle: "Login",
    path: "/login",
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        Manager.findOne({ email: email }).then((manager) => {
          if (!manager) {
            return res.redirect("/login");
          } else {
            if (manager.password !== password) {
              return res.redirect("/login");
            }
            // Quan li dang nhap
            req.session.isLoggedIn = {};
            req.session.isLoggedIn.manager = true;
            req.session.isLoggedIn.user = false;
            req.session.user = manager;
            return res.redirect("/covid");
          }
        });
      } else {
        if (user.password !== password) {
          return res.redirect("/login");
        }
        // Nhan vien dang nhap
        req.session.isLoggedIn = {};
        req.session.isLoggedIn.user = true;
        req.session.isLoggedIn.manager = false;
        req.session.user = user;
        return res.redirect("/");
      }
    })
    .catch((err) => next(err));
};

exports.getLogout = (req, res) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};
