const express = require("express");
const router = express.Router();

const { createDealer, updateUserProfile, deleteUserAccount } = require("../controllers/userController");
const { protect } = require("../middlewares/authMiddleware");
const { restrictTo } = require("../middlewares/roleMiddleware");

// 🔥 Admin creates dealer
router.post("/create-dealer", protect, restrictTo("admin"), createDealer);

// User updates profile
router.put("/profile", protect, updateUserProfile);

// User deletes account
router.delete("/delete-account", protect, deleteUserAccount);

module.exports = router;