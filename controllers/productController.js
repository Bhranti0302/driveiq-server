const Product = require("../models/Product");
const asyncHandler = require("../utils/asyncHandler");
const cloudinary = require("../utils/cloudinary");
const slugify = require("slugify");

// ================== CREATE PRODUCT ================== //
const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    longDescription,
    category,
    brand,
    specifications,
    variants, // ✅ NEW
  } = req.body;

  // ✅ Required fields
  if (!name || !category || !brand || !variants) {
    return res.status(400).json({
      message: "Missing required fields",
    });
  }

  // ✅ Validate variants
  if (!Array.isArray(variants) || variants.length === 0) {
    return res.status(400).json({
      message: "At least one variant is required",
    });
  }

  for (const v of variants) {
    if (!v.color || v.price == null || v.stock == null) {
      return res.status(400).json({
        message: "Each variant must have color, price, and stock",
      });
    }
  }

  // ✅ Prevent duplicate per dealer
  const existing = await Product.findOne({
    name: name.trim().toLowerCase(),
    dealer: req.user._id,
  });

  if (existing) {
    return res.status(400).json({
      message: "You already created this product",
    });
  }

  // ================= IMAGE HANDLING ================= //
  let parsedVariants = [...variants];

  // OPTIONAL: handle variant images (advanced)
  // For now keep simple

  const product = await Product.create({
    name: name.trim().toLowerCase(),
    slug: slugify(name, { lower: true }),
    description,
    longDescription,
    category,
    brand,
    specifications,
    variants: parsedVariants, // ✅ IMPORTANT
    dealer: req.user._id,
    status: "pending",
  });

  res.status(201).json({
    message: "Product created & sent for approval",
    product,
  });
});

// ================== APPROVE PRODUCT ================== //
const approveProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  if (product.status === "active") {
    return res.status(400).json({
      message: "Product already approved",
    });
  }

  product.status = "active";
  await product.save();

  res.json({ message: "Product approved successfully" });
});

// ================== REJECT PRODUCT ================== //
const rejectProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  product.status = "rejected";
  await product.save();

  res.json({ message: "Product rejected successfully" });
});

// ================== GET ALL PRODUCTS ================== //
const getAllProducts = asyncHandler(async (req, res) => {
  let filter = {};

  if (req.user?.role === "admin") {
    filter = {};
  } else if (req.user?.role === "dealer") {
    filter = { dealer: req.user._id };
  } else {
    filter = { status: "active" };
  }

  // ✅ Filter by color (inside variants)
  if (req.query.color) {
    filter["variants.color"] = req.query.color;
  }

  const products = await Product.find(filter)
    .populate("dealer", "name email")
    .sort({ createdAt: -1 });

  res.json({
    count: products.length,
    products,
  });
});

// ================== GET SINGLE PRODUCT ================== //
const getSingleProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate(
    "dealer",
    "name email",
  );

  if (!product) {
    return res.status(404).json({
      message: "Product not found",
    });
  }

  res.json(product);
});

// ================== UPDATE PRODUCT ================== //
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  // ✅ Authorization
  if (
    req.user.role !== "admin" &&
    product.dealer.toString() !== req.user._id.toString()
  ) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  // ================= UPDATE BASIC FIELDS ================= //
  product.name = req.body.name || product.name;
  product.slug = slugify(product.name, { lower: true });
  product.description = req.body.description || product.description;
  product.longDescription = req.body.longDescription || product.longDescription;
  product.category = req.body.category || product.category;
  product.brand = req.body.brand || product.brand;
  product.specifications = req.body.specifications || product.specifications;

  // ================= UPDATE VARIANTS ================= //
  if (req.body.variants) {
    if (!Array.isArray(req.body.variants) || req.body.variants.length === 0) {
      return res.status(400).json({
        message: "Variants must be a non-empty array",
      });
    }

    for (const v of req.body.variants) {
      if (!v.color || v.price == null || v.stock == null) {
        return res.status(400).json({
          message: "Each variant must have color, price, and stock",
        });
      }
    }

    product.variants = req.body.variants;
  }

  // 🔥 Reset status after update
  product.status = "pending";

  const updatedProduct = await product.save();

  res.json({
    message: "Product updated & sent for re-approval",
    updatedProduct,
  });
});

// ================== DELETE PRODUCT ================== //
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  // ✅ Authorization
  if (
    req.user.role !== "admin" &&
    product.dealer.toString() !== req.user._id.toString()
  ) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  await product.deleteOne();

  res.json({
    message: "Product deleted successfully",
  });
});

module.exports = {
  createProduct,
  approveProduct,
  rejectProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
};
