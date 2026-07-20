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

// Role => Dealer → Create product
router.post("/", protect, restrictTo("dealer"), createProduct);

//Logged users → View products as per role
router.get("/", protect, getAllProducts);

// Admin → Approve product 
router.put("/:id/approve", protect, restrictTo("admin"), approveProduct);

// 👑 Admin → Reject product
router.put("/:id/reject", protect, restrictTo("admin"), rejectProduct);

// Dealer + Admin can update product
router.put("/:id", protect, restrictTo("admin", "dealer"), updateProduct);

// Dealer + Admin can delete product
router.delete("/:id", protect, restrictTo("admin", "dealer"), deleteProduct);

module.exports = router;
