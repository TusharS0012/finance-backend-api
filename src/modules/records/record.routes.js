const express = require("express");
const recordController = require("./record.controller");
const { protect } = require("../../middlewares/auth.middleware");
const { restrictTo } = require("../../middlewares/rbac.middleware");

const router = express.Router();

// 1. ALL routes in this file require the user to be logged in
router.use(protect);

// 2. Define routes and attach specific Role-Based Access Control (RBAC)
router
  .route("/")
  .get(
    restrictTo("VIEWER", "ANALYST", "ADMIN"), // Everyone can view their own records
    recordController.getRecords,
  )
  .post(
    restrictTo("ADMIN", "ANALYST"), // Viewers cannot create records
    recordController.createRecord,
  );

router.route("/:id").delete(
  restrictTo("ADMIN"), // Only Admins can soft-delete records
  recordController.deleteRecord,
);

module.exports = router;
