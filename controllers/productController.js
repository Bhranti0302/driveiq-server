const Product = require("../models/Product");
const asyncHandler = require("../utils/asyncHandler");

// ================== Create product ================== //
const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    longDescription,
    price,
    quantity,
    category,
    brand,
    specifications,
  } = req.body;

  if (!name || !price || !quantity) {
    return res.status(400).json({
      message: "Missing required fields",
    });
  }

  // 🔥 Prevent duplicate
  const existing = await Product.findOne({
    name: name.trim().toLowerCase(),
  });

  if (existing) {
    return res.status(400).json({
      message: "Product already exists",
    });
  }

  const product = await Product.create({
    name,
    description,
    longDescription,
    price,
    quantity,
    category,
    brand,
    specifications,
    dealer: req.user._id,
    status: "pending",
  });

  res.status(201).json({
    message: "Product created & sent for approval",
    product,
  });
});

// ================== Approve product ================== //
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

  res.status(200).json({
    message: "Product approved successfully",
  });
});

// ================== Reject product ================== //
const rejectProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  if (product.status === "rejected") {
    return res.status(400).json({
      message: "Product already rejected",
    });
  }

  product.status = "rejected";
  await product.save();

  res.status(200).json({
    message: "Product rejected successfully",
  });
});

// ================== Get all products ================== //
const getAllProducts = asyncHandler(async (req, res) => {
  let filter = {};

  if (req.user.role === "admin") {
    filter = {}; // all
  } else if (req.user.role === "dealer") {
    filter = { dealer: req.user._id }; // own products
  } else {
    filter = { status: "active" }; // users
  }

  const products = await Product.find(filter)
    .populate("dealer", "name email")
    .sort({ createdAt: -1 });

  res.json({
    count: products.length,
    products,
  });
});

module.exports = {
  createProduct,
  approveProduct,
  rejectProduct,
  getAllProducts,
};
