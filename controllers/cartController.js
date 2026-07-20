const asyncHandler = require("../utils/asyncHandler");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

// Add to Cart
const addToCart = asyncHandler(async (req, res) => {
  if (req.user.role !== "user") {
    res.status(403);
    throw new Error("Only users can add to cart");
  }

  const { productId, quantity } = req.body;

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  if (product.quantity < quantity) {
    res.status(400);
    throw new Error("Not enough stock available");
  }

  let cart = await Cart.findOne({ user: req.user._id });

  // Create cart if not exists
  if (!cart) {
    cart = await Cart.create({
      user: req.user._id,
      items: [],
    });
  }

  // Check if product already in cart
  const itemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId,
  );

  if (itemIndex > -1) {
    // Update quantity
    cart.items[itemIndex].quantity += quantity;
  } else {
    // Add new item
    cart.items.push({ product: productId, quantity });
  }

  await cart.save();

  res.status(200).json({
    success: true,
    message: "Product added to cart",
    cart,
  });
});

module.exports = {
  addToCart,
};