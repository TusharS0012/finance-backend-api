const express = require("express");
const userController = require("./user.controller");
const { protect } = require("../../middlewares/auth.middleware");
const { restrictTo } = require("../../middlewares/rbac.middleware");

const router = express.Router();

// 1. ALL routes in this file require the user to be logged in
router.use(protect);

// 2. Define routes and attach specific Role-Based Access Control (RBAC)
router.route("/").get(
  restrictTo("ADMIN", "ANALYST"), // Analysts can view the roster, Viewers cannot
  userController.getAllUsers,
);

// 3. Strictly Admin-only actions
router.use(restrictTo("ADMIN")); // Everything below this line requires ADMIN

router
  .route("/:id")
  .patch(userController.updateUserAccess) // Change Role or Status
  .delete(userController.deleteUser); // Soft Delete

module.exports = router;
