const express = require("express");

const { protect } = require("../middlewares/authMiddleware");
const { restrictTo } = require("../middlewares/roleMiddleware");

const {
  createProduct,
  getAllProducts,
  approveProduct,
  rejectProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const { uploadProductImages } = require("../middlewares/upload");

const router = express.Router();

// ================= CREATE PRODUCT ================= //
router.post(
  "/",
  protect,
  restrictTo("dealer"),
  uploadProductImages.fields([
    { name: "mainImage", maxCount: 1 },
    { name: "images", maxCount: 5 },
  ]),
  createProduct,
);

// ================= GET PRODUCTS ================= //
router.get("/", protect, getAllProducts);

// ================= ADMIN ACTIONS ================= //
router.put("/:id/approve", protect, restrictTo("admin"), approveProduct);
router.put("/:id/reject", protect, restrictTo("admin"), rejectProduct);

// ================= UPDATE PRODUCT ================= //
router.put(
  "/:id",
  protect,
  restrictTo("admin", "dealer"),
  uploadProductImages.fields([
    { name: "mainImage", maxCount: 1 },
    { name: "images", maxCount: 5 },
  ]),
  updateProduct,
);

// ================= DELETE PRODUCT ================= //
router.delete("/:id", protect, restrictTo("admin", "dealer"), deleteProduct);

module.exports = router;
