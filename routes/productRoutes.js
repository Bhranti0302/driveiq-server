const express = require("express");

const { protect } = require("../middlewares/authMiddleware");
const { restrictTo } = require("../middlewares/roleMiddleware");

const { createProduct } = require("../controllers/productController");

const router = express.Router();

router.post("/", protect, restrictTo("dealer"), createProduct);

module.exports = router;
