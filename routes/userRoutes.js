const express = require("express");
const router = express.Router();

// ================= CONTROLLERS ================= //
const {
  createDealer,
  updateUserProfile,
  deleteUserAccount,
  getAllDealers,
  getAllUsers,
  updateDealerByAdmin,
  deleteDealerByAdmin,
  updateOwnDealerProfile,
  deleteOwnDealerAccount,
  uploadProfileImage,
  deleteProfileImage,
} = require("../controllers/userController");

// ================= MIDDLEWARES ================= //
const { protect } = require("../middlewares/authMiddleware");
const { restrictTo } = require("../middlewares/roleMiddleware");

// ================= FILE UPLOAD ================= //
const { uploadUserImage } = require("../middlewares/upload");

// ====================================================== //
// ====================== USERS ========================== //
// ====================================================== //

// Get all users (ADMIN ONLY)
router.get("/users", protect, restrictTo("admin"), getAllUsers);

// Update logged-in user profile
router.put("/profile", protect, updateUserProfile);

// Delete logged-in user account
router.delete("/delete-account", protect, deleteUserAccount);

// ====================================================== //
// ====================== DEALERS (ADMIN) ================= //
// ====================================================== //

// Get all dealers
router.get("/dealers", protect, restrictTo("admin"), getAllDealers);

// Create dealer
router.post("/create-dealer", protect, restrictTo("admin"), createDealer);

// Update dealer by ID (ADMIN)
router.put("/dealer/:id", protect, restrictTo("admin"), updateDealerByAdmin);

// Delete dealer by ID (ADMIN)
router.delete("/dealer/:id", protect, restrictTo("admin"), deleteDealerByAdmin);

// ====================================================== //
// ================== DEALER (SELF) ====================== //
// ====================================================== //

// Dealer updates own profile
router.put("/dealer/profile", protect, updateOwnDealerProfile);

// Dealer deletes own account
router.delete("/dealer/delete-account", protect, deleteOwnDealerAccount);

// ====================================================== //
// ================= PROFILE IMAGE ======================= //
// ====================================================== //

// Upload / Replace profile image
router.put(
  "/profile/image",
  protect,
  uploadUserImage.single("image"),
  uploadProfileImage,
);

// Delete profile image
router.delete("/profile/image", protect, deleteProfileImage);

// ====================================================== //

module.exports = router;
