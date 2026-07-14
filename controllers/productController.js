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

// ================ Update product ================ //
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)

  // Checlk if product exists
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  // Authorization
  if (
    req.user.role !== "admin" &&
    product.dealer.toString() !== req.user._id.toString()
  ) {
    return status(403).json({ message: "Unauthorized" })
  }

  // Safe update(only update if value  exists)
  product.name = req.body.name || product.name;
  product.description = req.body.description || product.description;
  product.longDescription = req.body.longDescription || product.longDescription;
  product.price = req.body.price || product.price;
  product.quantity = req.body.quantity || product.quantity;
  product.category = req.body.category || product.category;
  product.brand = req.body.brand || product.brand;
  product.specifications = req.body.specifications || product.specifications;

  // Reset status
  product.status = "pending";

  const updatedProduct = await product.save();
  res.json({
    message: "Product updated successfully",
    updatedProduct,
  });
})           


module.exports = {
  createProduct,
  approveProduct,
  rejectProduct,
  getAllProducts,
  updateProduct
};
