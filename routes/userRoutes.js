const express = require("express");
const router = express.Router();

const { createDealer, updateUserProfile, deleteUserAccount, getAllDealers, getAllUsers } = require("../controllers/userController");
const { protect } = require("../middlewares/authMiddleware");
const { restrictTo } = require("../middlewares/roleMiddleware");


// Get All User
router.get("/users", protect, restrictTo("admin"), getAllUsers);

// Get All Dealer
router.get("/dealers", protect, restrictTo("admin"), getAllDealers);

// 🔥 Admin creates dealer
router.post("/create-dealer", protect, restrictTo("admin"), createDealer);

// User updates profile
router.put("/profile", protect, updateUserProfile);

// User deletes account
router.delete("/delete-account", protect, deleteUserAccount);

module.exports = router;