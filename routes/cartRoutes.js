const express = require("express")
const router = express.Router();

const { addToCart, getUserCart } = require("../controllers/cartController");

const { protect } = require("../middlewares/authMiddleware");

// Add to cart
router.post("/", protect, addToCart);

// Get Cart
router.get("/", protect, getUserCart);

module.exports = router