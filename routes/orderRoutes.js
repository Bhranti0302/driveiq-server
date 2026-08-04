const express = require("express");
const router = express.Router();

const {
  createOrder,
  getMyOrders,
  getAllOrders,
  getSingleOrder,
  updateOrderStatus,
  deleteOrder,
} = require("../controllers/orderController");

const { protect } = require("../middlewares/authMiddleware");

// ================== USER ROUTES ================== //

// ✅ Create Order
router.post("/", protect, createOrder);

// ✅ Get logged-in user's orders
router.get("/my-orders", protect, getMyOrders);

// ================== ADMIN ROUTES ================== //

// ✅ Get all orders (admin)
router.get("/", protect, getAllOrders);

// ================== COMMON ROUTES ================== //

// ⚠️ IMPORTANT: Keep this AFTER "/my-orders"
router.get("/:id", protect, getSingleOrder);

// ================== ADMIN ACTIONS ================== //

// ✅ Update order status (admin)
router.put("/:id/status", protect, updateOrderStatus);

// ✅ Delete order (admin)
router.delete("/:id", protect, deleteOrder);

module.exports = router;
