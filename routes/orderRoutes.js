const express = require("express");
const router = express.Router();

// Controllers
const {
  createOrder,
  getMyOrders,
  getAllOrders,
  getSingleOrder,
  updateOrderStatus,
  deleteOrder,
} = require("../controllers/orderController");

// Middleware
const { protect } = require("../middlewares/authMiddleware");
const { restrictTo } = require("../middlewares/roleMiddleware");

// ================== USER ROUTES ================== //

// ➕ Create Order
router.post("/", protect, createOrder);

// 📦 Get logged-in user's orders
router.get("/my", protect, getMyOrders);

// ================== ADMIN ROUTES ================== //

// 📊 Get all orders (ADMIN ONLY)
router.get("/", protect, restrictTo("admin"), getAllOrders);

// ================== COMMON ROUTES ================== //

// 🔍 Get single order (user or admin)
router.get("/:id", protect, getSingleOrder);

// ================== ADMIN ACTIONS ================== //

// 🔄 Update order status (ADMIN ONLY)
router.put("/:id/status", protect, restrictTo("admin"), updateOrderStatus);

// ❌ Delete order (ADMIN ONLY)
router.delete("/:id", protect, restrictTo("admin"), deleteOrder);

module.exports = router;
