const express = require("express");

const { protect } = require("../middlewares/authMiddleware");
const { restrictTo } = require("../middlewares/roleMiddleware");

const {
  createProduct,
  getAllProducts,
} = require("../controllers/productController");

const router = express.Router();

// 🏪 Dealer
router.post("/", protect, restrictTo("dealer"), createProduct);

// 👤 All logged users
router.get("/", protect, getAllProducts);

module.exports = router;
