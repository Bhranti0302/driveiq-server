const express = require("express");
const router = express.Router();

const {
  createDealer,
  updateUserProfile,
  deleteUserAccount,
  getAllDealers,
  getAllUsers,
  updateDealerByAdmin,
  deleteDealerByAdmin,
} = require("../controllers/userController");
const { protect } = require("../middlewares/authMiddleware");
const { restrictTo } = require("../middlewares/roleMiddleware");


// User

// ******************************************************//

// Get All User
router.get("/users", protect, restrictTo("admin"), getAllUsers);

// User updates profile
router.put("/profile", protect, updateUserProfile);

// User deletes account
router.delete("/delete-account", protect, deleteUserAccount);

// ******************************************************//

// Dealer

// ******************************************************//

// Get All Dealer
router.get("/dealers", protect, restrictTo("admin"), getAllDealers);

// 🔥 Admin creates dealer
router.post("/create-dealer", protect, restrictTo("admin"), createDealer);

// Update Dealer By Admin
router.put("/:id", protect, restrictTo("admin"), updateDealerByAdmin);

// Delete Dealer By Admin
router.delete("/:id", protect, restrictTo("admin"), deleteDealerByAdmin);

// ******************************************************//

module.exports = router;