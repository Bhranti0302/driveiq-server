const express = require("express")
const router = express.Router();

const { addToCart } = require("../controllers/cartController");

const { protect } = require("../middlewares/authMiddleware");

// Add to cart
router.post("/", protect, addToCart);

module.exports = router