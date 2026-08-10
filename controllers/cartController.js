const asyncHandler = require("../utils/asyncHandler");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

// =================== Add to Cart =================== //
const addToCart = asyncHandler(async (req, res) => {
  if (req.user.role !== "user") {
    res.status(403);
    throw new Error("Only users can add to cart");
  }

  const { productId, quantity } = req.body;

  if (!productId || !quantity) {
    res.status(400);
    throw new Error("Product and quantity are required");
  }

  const product = await Product.findById(productId);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  // 🔥 Check stock from product.quantity
  if (product.quantity < quantity) {
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

  // 🔥 Check existing item (ONLY product)
  const itemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId,
  );

  if (itemIndex > -1) {
    const newQty = cart.items[itemIndex].quantity + quantity;

    if (newQty > product.quantity) {
      res.status(400);
      throw new Error("Exceeds available stock");
    }

    cart.items[itemIndex].quantity = newQty;
  } else {
    cart.items.push({
      product: productId,
      quantity,
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
    select: "name price mainImage quantity",
  });

  if (!cart) {
    return res.status(200).json({
      success: true,
      cart: { items: [], cartTotal: 0 },
    });
  }

  // 🔥 Simplified response
  const items = cart.items.map((item) => ({
    product: item.product._id,
    name: item.product.name,
    quantity: item.quantity,
    price: item.product.price,
    stock: item.product.quantity,
    image: item.product.mainImage?.url || "",
    total: item.product.price * item.quantity,
  }));

  res.status(200).json({
    success: true,
    count: items.length,
    cart: {
      items,
      cartTotal: cart.cartTotal,
    },
  });
});

// ============== Update Cart Item Quantity ============= //
const updateCartItem = asyncHandler(async (req, res) => {
  if (req.user.role !== "user") {
    res.status(403);
    throw new Error("Only users can update cart");
  }

  const { productId } = req.params;
  const { quantity } = req.body;

  if (quantity === undefined) {
    res.status(400);
    throw new Error("Quantity is required");
  }

  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    res.status(404);
    throw new Error("Cart not found");
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId,
  );

  if (itemIndex === -1) {
    res.status(404);
    throw new Error("Item not found in cart");
  }

  const product = await Product.findById(productId);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  if (quantity > product.quantity) {
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

  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    res.status(404);
    throw new Error("Cart not found");
  }

  cart.items = cart.items.filter(
    (item) => item.product.toString() !== productId,
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
