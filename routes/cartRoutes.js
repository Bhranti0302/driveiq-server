const express = require("express");
const router = express.Router();

// Controllers
const {
  addToCart,
  getUserCart,
  updateCartItem,
  removeCartItem,
} = require("../controllers/cartController");

// Middleware
const { protect } = require("../middlewares/authMiddleware");

// ================= CART ROUTES ================= //

// ➕ Add product to cart
// POST /api/cart
router.post("/", protect, addToCart);

// 📦 Get logged-in user's cart
// GET /api/cart
router.get("/", protect, getUserCart);

// 🔄 Update quantity of a product in cart
// PUT /api/cart/item/:productId
router.put("/item/:productId", protect, updateCartItem);

// ❌ Remove product from cart
// DELETE /api/cart/item/:productId
router.delete("/item/:productId", protect, removeCartItem);

module.exports = router;
