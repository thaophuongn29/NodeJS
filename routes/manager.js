const express = require("express");
const router = express.Router();
const managerControllers = require("../controllers/manager");
const managerMiddleware = require("../middleware/is-auth");

router.get(
  "/confirm",
  managerMiddleware.isAuthManager,
  managerControllers.getConfirm
);

// Chuyen trang thai
router.post(
  "/confirm",
  managerMiddleware.isAuthManager,
  managerControllers.postConfirm
);

// Gio lam nhan vien theo userId
router.get(
  "/confirm/:userId",
  managerMiddleware.isAuthManager,
  managerControllers.getUser
);

// Xoa du lieu gio lam cua nhan vien
router.post(
  "/confirm/:userId",
  managerMiddleware.isAuthManager,
  managerControllers.postDeleteData
);

router.get(
  "/covid/:userId",
  managerMiddleware.isAuthManager,
  managerControllers.getCovidPdf
);

module.exports = router;
