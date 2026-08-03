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
    price,
    quantity,
    category,
    brand,
    specifications,
  } = req.body;

  if (!name || !price || !quantity || !category || !brand) {
    return res.status(400).json({
      message: "Missing required fields",
    });
  }

  // ✅ Prevent duplicate (per dealer)
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
  let mainImage = { url: "", public_id: "" };
  let images = [];

  if (req.files) {
    // main image
    if (req.files.mainImage) {
      mainImage = {
        url: req.files.mainImage[0].path,
        public_id: req.files.mainImage[0].filename,
      };
    }

    // multiple images
    if (req.files.images) {
      images = req.files.images.map((file) => ({
        url: file.path,
        public_id: file.filename,
      }));
    }
  }

  const product = await Product.create({
    name: name.trim().toLowerCase(),
    slug: slugify(name, { lower: true }),
    description,
    longDescription,
    price,
    quantity,
    category,
    brand,
    specifications,
    dealer: req.user._id,
    status: "pending",
    mainImage,
    images,
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

  if (req.user.role === "admin") {
    filter = {};
  } else if (req.user.role === "dealer") {
    filter = { dealer: req.user._id };
  } else {
    filter = { status: "active" };
  }

  const products = await Product.find(filter)
    .populate("dealer", "name email")
    .sort({ createdAt: -1 });

  res.json({
    count: products.length,
    products,
  });
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

  // ================= DELETE OLD IMAGES ================= //
  if (req.files?.mainImage && product.mainImage?.public_id) {
    await cloudinary.uploader.destroy(product.mainImage.public_id);
  }

  if (req.files?.images && product.images.length > 0) {
    for (const img of product.images) {
      if (img.public_id) {
        await cloudinary.uploader.destroy(img.public_id);
      }
    }
  }

  // ================= UPDATE FIELDS ================= //
  product.name = req.body.name || product.name;
  product.slug = slugify(product.name, { lower: true });
  product.description = req.body.description || product.description;
  product.longDescription = req.body.longDescription || product.longDescription;
  product.price = req.body.price || product.price;
  product.quantity = req.body.quantity || product.quantity;
  product.category = req.body.category || product.category;
  product.brand = req.body.brand || product.brand;
  product.specifications = req.body.specifications || product.specifications;

  // ================= UPDATE IMAGES ================= //
  if (req.files?.mainImage) {
    product.mainImage = {
      url: req.files.mainImage[0].path,
      public_id: req.files.mainImage[0].filename,
    };
  }

  if (req.files?.images) {
    product.images = req.files.images.map((file) => ({
      url: file.path,
      public_id: file.filename,
    }));
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

  // ================= DELETE IMAGES ================= //
  if (product.mainImage?.public_id) {
    await cloudinary.uploader.destroy(product.mainImage.public_id);
  }

  for (const img of product.images) {
    if (img.public_id) {
      await cloudinary.uploader.destroy(img.public_id);
    }
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
  updateProduct,
  deleteProduct,
};
