const asyncHandler = require("../utils/asyncHandler");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

// =================== Add to Cart =================== //
const addToCart = asyncHandler(async (req, res) => {
  if (req.user.role !== "user") {
    res.status(403);
    throw new Error("Only users can add to cart");
  }

  const { productId, quantity, color } = req.body;

  if (!productId || !quantity || !color) {
    res.status(400);
    throw new Error("Product, quantity and color are required");
  }

  const product = await Product.findById(productId);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  // ✅ Find variant
  const variant = product.variants.find(
    (v) => v.color.toLowerCase() === color.toLowerCase(),
  );

  if (!variant) {
    res.status(400);
    throw new Error("Selected color not available");
  }

  if (variant.stock < quantity) {
    res.status(400);
    throw new Error("Not enough stock available");
  }

  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    cart = await Cart.create({
      user: req.user._id,
      items: [],
    });
  }

  // ✅ Check product + color
  const itemIndex = cart.items.findIndex(
    (item) =>
      item.product.toString() === productId &&
      item.color.toLowerCase() === color.toLowerCase(),
  );

  if (itemIndex > -1) {
    // 🔥 Prevent exceeding stock
    const newQty = cart.items[itemIndex].quantity + quantity;

    if (newQty > variant.stock) {
      res.status(400);
      throw new Error("Exceeds available stock");
    }

    cart.items[itemIndex].quantity = newQty;
  } else {
    cart.items.push({
      product: productId,
      quantity,
      color,
    });
  }

  await cart.save();

  res.status(200).json({
    success: true,
    message: "Product added to cart",
    cart,
  });
});

// =================== Get User Cart =================== //
const getUserCart = asyncHandler(async (req, res) => {
  if (req.user.role !== "user") {
    res.status(403);
    throw new Error("Only users can access cart");
  }

  const cart = await Cart.findOne({ user: req.user._id }).populate({
    path: "items.product",
    select: "name mainImage variants",
  });

  if (!cart) {
    return res.status(200).json({
      success: true,
      cart: { items: [] },
    });
  }

  // ✅ Attach variant details dynamically
  const items = cart.items.map((item) => {
    const product = item.product;

    const variant = product.variants.find(
      (v) => v.color.toLowerCase() === item.color.toLowerCase(),
    );

    return {
      _id: item._id,
      product: product._id,
      name: product.name,
      color: item.color,
      quantity: item.quantity,
      price: variant?.price || 0,
      stock: variant?.stock || 0,
      image: product.mainImage?.url || "",
    };
  });

  res.status(200).json({
    success: true,
    count: items.length,
    cart: { items },
  });
});

// ============== Update Cart Item Quantity ============= //
const updateCartItem = asyncHandler(async (req, res) => {
  if (req.user.role !== "user") {
    res.status(403);
    throw new Error("Only users can update cart");
  }

  const { productId } = req.params;
  const { quantity, color } = req.body;

  if (quantity === undefined || !color) {
    res.status(400);
    throw new Error("Quantity and color are required");
  }

  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    res.status(404);
    throw new Error("Cart not found");
  }

  const itemIndex = cart.items.findIndex(
    (item) =>
      item.product.toString() === productId &&
      item.color.toLowerCase() === color.toLowerCase(),
  );

  if (itemIndex === -1) {
    res.status(404);
    throw new Error("Item not found in cart");
  }

  const product = await Product.findById(productId);

  const variant = product.variants.find(
    (v) => v.color.toLowerCase() === color.toLowerCase(),
  );

  if (!variant) {
    res.status(400);
    throw new Error("Variant not found");
  }

  if (quantity > variant.stock) {
    res.status(400);
    throw new Error("Not enough stock available");
  }

  if (quantity === 0) {
    cart.items.splice(itemIndex, 1);
  } else {
    cart.items[itemIndex].quantity = quantity;
  }

  await cart.save();

  res.status(200).json({
    success: true,
    message: "Cart updated",
    cart,
  });
});

// ================= Remove Cart Item ================= //
const removeCartItem = asyncHandler(async (req, res) => {
  if (req.user.role !== "user") {
    res.status(403);
    throw new Error("Only users can remove items");
  }

  const { productId } = req.params;
  const { color } = req.body;

  if (!color) {
    res.status(400);
    throw new Error("Color is required");
  }

  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    res.status(404);
    throw new Error("Cart not found");
  }

  cart.items = cart.items.filter(
    (item) =>
      !(
        item.product.toString() === productId &&
        item.color.toLowerCase() === color.toLowerCase()
      ),
  );

  await cart.save();

  res.status(200).json({
    success: true,
    message: "Item removed from cart",
    cart,
  });
});

module.exports = {
  addToCart,
  getUserCart,
  updateCartItem,
  removeCartItem,
};
