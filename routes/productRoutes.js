const express = require("express");

const { protect } = require("../middlewares/authMiddleware");
const { restrictTo } = require("../middlewares/roleMiddleware");

const {
  createProduct,
  getAllProducts,
  approveProduct,
  rejectProduct,
  updateProduct,
  deleteProduct
} = require("../controllers/productController");

const router = express.Router();

// 🏪 Dealer → Create product
router.post("/", protect, restrictTo("dealer"), createProduct);

// 👤 Logged users → View products
router.get("/", protect, getAllProducts);

// 👑 Admin → Approve
router.put("/:id/approve", protect, restrictTo("admin"), approveProduct);

// 👑 Admin → Reject
router.put("/:id/reject", protect, restrictTo("admin"), rejectProduct);

// Dealer + Admin can update
router.put("/:id", protect, restrictTo("admin", "dealer"), updateProduct);

// Dealer + Admin can delete
router.delete("/:id", protect, restrictTo("admin", "dealer"), deleteProduct);

module.exports = router;
