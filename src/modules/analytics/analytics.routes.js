const express = require("express");
const analyticsController = require("./analytics.controller");
const { protect } = require("../../middlewares/auth.middleware");

const router = express.Router();

// All analytics routes require authentication
router.use(protect);

router.get("/dashboard", analyticsController.getDashboard);

module.exports = router;
