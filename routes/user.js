const express = require("express");
const router = express.Router();
const userControllers = require("../controllers/user");
const isAuthMiddleware = require("../middleware/is-auth");

router.get("/", isAuthMiddleware.isAuthUser, userControllers.getAttendance);
router.post("/", isAuthMiddleware.isAuthUser, userControllers.postAttendance);
router.get("/user", isAuthMiddleware.isAuthUser, userControllers.getUser);
router.post("/user", isAuthMiddleware.isAuthUser, userControllers.postUser);
router.get("/covid", isAuthMiddleware.isAuth, userControllers.getCovid);
router.post("/covid", isAuthMiddleware.isAuthUser, userControllers.postCovid);
router.get("/detail", isAuthMiddleware.isAuthUser, userControllers.getDetail);
router.get(
  "/detail/:page",
  isAuthMiddleware.isAuthUser,
  userControllers.getDetail
);
router.post(
  "/annualLeave",
  isAuthMiddleware.isAuthUser,
  userControllers.postAnnualLeave
);

module.exports = router;
