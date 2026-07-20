const express = require("express");
const router = express.Router();

const { createOrder } = require("../controllers/orderController");

const { protect } = require("../middlewares/authMiddleware");

// Create Order
router.post("/", protect, createOrder);

module.exports = router;