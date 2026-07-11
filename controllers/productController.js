const Product = require("../models/Product");
const asyncHandler = require("./../utils/asyncHandler");

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
    rating,
  } = req.body;

  const product = await Product.create({
    name,
    description,
    longDescription,
    price,
    quantity,
    category,
    brand,
    rating,
  });

  res.status(201).json({
    message: "Product created successfully",
    product,
  });
});
