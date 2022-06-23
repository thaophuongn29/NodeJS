exports.isAuthUser = (req, res, next) => {
  if (req.session.isLoggedIn) {
    if (req.session.isLoggedIn.user) {
      return next();
    } else {
      return res.redirect("/404");
    }
  } else {
    return res.redirect("/login");
  }
};

exports.isAuthManager = (req, res, next) => {
  if (req.session.isLoggedIn) {
    if (req.session.isLoggedIn.manager) {
      return next();
    } else {
      return res.redirect("/404");
    }
  } else {
    return res.redirect("/login");
  }
};

exports.isAuth = (req, res, next) => {
  if (!req.session.isLoggedIn) {
    return res.redirect("/login");
  }
  next();
};
