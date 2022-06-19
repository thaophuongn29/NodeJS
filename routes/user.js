const express = require("express");
const router = express.Router();
const userControllers = require("../controllers/user");

router.get("/", userControllers.getAttendance);
router.post("/", userControllers.postAttendance);
router.get("/user", userControllers.getUser);
router.post("/user", userControllers.postUser);
router.get("/covid", userControllers.getCovid);
router.post("/covid", userControllers.postCovid);
router.get("/detail", userControllers.getDetail);
router.post("/annualLeave", userControllers.postAnnualLeave);

module.exports = router;
