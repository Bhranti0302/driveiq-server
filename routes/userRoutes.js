const express = require("express");
const router = express.Router();

const { createDealer, updateUser } = require("../controllers/userController");
const { protect } = require("../middlewares/authMiddleware");
const { restrictTo } = require("../middlewares/roleMiddleware");

// 🔥 Admin creates dealer
router.post("/create-dealer", protect, restrictTo("admin"), createDealer);

// Dealer + Admin can update
router.put("/profile", protect, restrictTo("admin", "dealer"), updateUser);

module.exports = router;