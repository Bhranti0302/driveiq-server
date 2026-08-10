const express = require("express");

const { protect } = require("../middlewares/authMiddleware");
const { restrictTo } = require("../middlewares/roleMiddleware");

const {
  createProduct,
  getAllProducts,
  getSingleProduct,
  approveProduct,
  rejectProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const { uploadProductImages } = require("../middlewares/upload");

const router = express.Router();

// ================= IMAGE CONFIG ================= //
const uploadFields = uploadProductImages.fields([
  { name: "mainImage", maxCount: 1 },
  { name: "images", maxCount: 5 },
]);

// ================= PUBLIC / USER ================= //

// 👉 Get all products (admin/dealer/user handled inside controller)
router.get("/", protect, getAllProducts);

// 👉 Get single product
router.get("/:id", protect, getSingleProduct);

// ================= DEALER ================= //

// 👉 Create product
router.post("/", protect, restrictTo("dealer"), uploadFields, createProduct);

// 👉 Update product (dealer can update own, admin can update all)
router.put(
  "/:id",
  protect,
  restrictTo("admin", "dealer"),
  uploadFields,
  updateProduct,
);

// 👉 Delete product
router.delete("/:id", protect, restrictTo("admin", "dealer"), deleteProduct);

// ================= ADMIN ================= //

// 👉 Approve product
router.patch("/:id/approve", protect, restrictTo("admin"), approveProduct);

// 👉 Reject product
router.patch("/:id/reject", protect, restrictTo("admin"), rejectProduct);

module.exports = router;
