const Product = require("../models/Product");
const asyncHandler = require("../utils/asyncHandler");

// ================== CREATE PRODUCT ================== //
const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    longDescription,
    category,
    brand,
    specifications,
    price,
    quantity,
  } = req.body;

  // ✅ Validation
  if (!name || !description || !longDescription || !category || !brand) {
    return res.status(400).json({
      message: "All required fields must be provided",
    });
  }

  // ✅ Duplicate check (same dealer)
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
  let mainImage = {};
  let images = [];

  if (req.files) {
    // ✅ main image
    if (req.files.mainImage) {
      const file = req.files.mainImage[0];

      mainImage = {
        url: file.path,
        public_id: file.filename,
      };
    }

    // ✅ multiple images
    if (req.files.images) {
      images = req.files.images.map((file) => ({
        url: file.path,
        public_id: file.filename,
      }));
    }
  }

  // ================= CREATE ================= //
  const product = await Product.create({
    name: name.trim().toLowerCase(),
    description,
    longDescription,
    category,
    brand,
    specifications:
      typeof specifications === "string"
        ? JSON.parse(specifications)
        : specifications,

    price: Number(price), 
    quantity: Number(quantity), 

    dealer: req.user._id,
    status: "pending",
    mainImage,
    images,
  });

  res.status(201).json({
    message: "Product created successfully",
    product,
  });
});

// ================== APPROVE PRODUCT ================== //
const approveProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
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
// const getAllProducts = asyncHandler(async (req, res) => {
//   let filter = {};

//   if (req.user?.role === "admin") {
//     filter = {};
//   } else if (req.user?.role === "dealer") {
//     filter = { dealer: req.user._id };
//   } else {
//     filter = { status: "active" };
//   }

//   const products = await Product.find(filter)
//     .populate("dealer", "name email")
//     .sort({ createdAt: -1 });

//   res.json({
//     count: products.length,
//     products,
//   });
// });

const getAllProducts = asyncHandler(async (req, res) => {
  const {
    category,
    brand,
    minPrice,
    maxPrice,
    sort,
    search, // 🔥 NEW
    page = 1,
    limit = 10,
  } = req.query;

  // 🔹 Filter Object
  let filter = {};

  // 🔍 Search Filter (name + brand)
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { brand: { $regex: search, $options: "i" } },
    ];
  }

  // Category Filter
  if (category) {
    filter.category = category;
  }

  // Brand Filter
  if (brand) {
    filter.brand = brand;
  }

  // Price Filter
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  // 🔹 Pagination
  const currentPage = Number(page);
  const perPage = Number(limit);
  const skip = (currentPage - 1) * perPage;

  // 🔹 Total Count
  const totalProducts = await Product.countDocuments(filter);

  // 🔹 Query Builder
  let query = Product.find(filter);

  // 🔹 Sorting
  if (sort) {
    query = query.sort(sort); // price / -price
  } else {
    query = query.sort("-createdAt");
  }

  // 🔹 Pagination Apply
  query = query.skip(skip).limit(perPage);

  // 🔹 Execute
  const products = await query;

  // 🔹 Response
  res.status(200).json({
    success: true,
    totalProducts,
    currentPage,
    totalPages: Math.ceil(totalProducts / perPage),
    count: products.length,
    data: products,
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

  // ================= BASIC UPDATE ================= //
  product.name = req.body.name
    ? req.body.name.trim().toLowerCase()
    : product.name;

  product.description = req.body.description || product.description;
  product.longDescription = req.body.longDescription || product.longDescription;
  product.category = req.body.category || product.category;
  product.brand = req.body.brand || product.brand;
  product.specifications = req.body.specifications || product.specifications;

  // ================= IMAGE UPDATE ================= //
  if (req.files) {
    req.files.forEach((file) => {
      if (file.fieldname === "mainImage") {
        product.mainImage = {
          url: file.path,
          public_id: file.filename,
        };
      }

      if (file.fieldname === "images") {
        product.images.push({
          url: file.path,
          public_id: file.filename,
        });
      }
    });
  }

  // ✅ Send for re-approval after update
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

// ================== EXPORT ================== //
module.exports = {
  createProduct,
  approveProduct,
  rejectProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
};
