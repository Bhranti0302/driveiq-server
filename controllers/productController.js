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
    specifications,
  } = req.body;

  if (!name || !price || !quantity) {
    return res.status(400).json({
      message: " Missing required fields",
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
  });

  res.status(201).json({
    message: "Product created successfully",
    product,
  });
  
});

module.exports = {
  createProduct,
};