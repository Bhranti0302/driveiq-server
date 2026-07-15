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
  updateOwnDealerProfile
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

// Dealer create, update, delete by admin

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

// logged User can update own dealer profile

// ******************************************************//

// Update Own Dealer Profile
router.put("/profile", protect, updateOwnDealerProfile);

module.exports = router;