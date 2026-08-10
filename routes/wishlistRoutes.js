const express = require("express");
const router = express.Router();

const {
  toggleWishlist,
  getWishlist,
  removeFromWishlist,
} = require("../controllers/wishlistController");

const { protect } = require("../middlewares/authMiddleware");

// ❤️ Wishlist routes

// Toggle (add/remove)
router.post("/:productId", protect, toggleWishlist);

// Get wishlist
router.get("/", protect, getWishlist);

// Remove item
router.delete("/:productId", protect, removeFromWishlist);

module.exports = router;
