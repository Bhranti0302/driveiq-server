const asyncHandler = require("../utils/asyncHandler");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Order = require("../models/Order");

// ================== CREATE ORDER ================== //
const createOrder = asyncHandler(async (req, res) => {
  if (req.user.role !== "user") {
    res.status(403);
    throw new Error("Only users can create an order");
  }

  const { shippingAddress, paymentMethod } = req.body;

  // ✅ Validate address
  if (
    !shippingAddress ||
    !shippingAddress.fullName ||
    !shippingAddress.phone ||
    !shippingAddress.address ||
    !shippingAddress.city ||
    !shippingAddress.postalCode ||
    !shippingAddress.country
  ) {
    res.status(400);
    throw new Error("Complete shipping address is required");
  }

  const cart = await Cart.findOne({ user: req.user._id }).populate(
    "items.product",
  );

  if (!cart || cart.items.length === 0) {
    res.status(400);
    throw new Error("Cart is empty");
  }

  let totalPrice = 0;
  const orderItems = [];

  // 🔥 PROCESS CART ITEMS
  for (const item of cart.items) {
    const product = item.product;

    if (!product) {
      res.status(404);
      throw new Error("Product not found");
    }

    // ✅ Find variant
    const variant = product.variants.find(
      (v) => v.color.toLowerCase() === item.color.toLowerCase(),
    );

    if (!variant) {
      res.status(400);
      throw new Error(`Variant (${item.color}) not found for ${product.name}`);
    }

    // ✅ Stock check
    if (variant.stock < item.quantity) {
      res.status(400);
      throw new Error(`Not enough stock for ${product.name} (${item.color})`);
    }

    // ✅ Deduct stock
    variant.stock -= item.quantity;
    await product.save();

    // ✅ Add to order
    orderItems.push({
      product: product._id,
      name: product.name,
      color: item.color,
      price: variant.price,
      quantity: item.quantity,
      image: product.mainImage?.url || "",
    });

    totalPrice += variant.price * item.quantity;
  }

  // ✅ Create order
  const order = await Order.create({
    user: req.user._id,
    orderItems,
    totalPrice,
    shippingAddress,
    paymentMethod: paymentMethod || "cod",
  });

  // ✅ Clear cart
  cart.items = [];
  cart.cartTotal = 0;
  await cart.save();

  res.status(201).json({
    success: true,
    message: "Order created successfully",
    order,
  });
});

// ================== GET MY ORDERS ================== //
const getMyOrders = asyncHandler(async (req, res) => {
  if (req.user.role !== "user") {
    res.status(403);
    throw new Error("Only users can view their orders");
  }

  const orders = await Order.find({ user: req.user._id }).sort({
    createdAt: -1,
  });

  res.status(200).json({
    success: true,
    count: orders.length,
    orders,
  });
});

// ================== GET ALL ORDERS (ADMIN) ================== //
const getAllOrders = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin") {
    res.status(403);
    throw new Error("Only admin can view all orders");
  }

  const orders = await Order.find()
    .populate("user", "name email")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: orders.length,
    orders,
  });
});

// ================== GET SINGLE ORDER ================== //
const getSingleOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email",
  );

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  // ✅ Owner or admin only
  if (
    req.user.role !== "admin" &&
    order.user._id.toString() !== req.user._id.toString()
  ) {
    res.status(403);
    throw new Error("Not authorized to view this order");
  }

  res.status(200).json({
    success: true,
    order,
  });
});

// ================== UPDATE ORDER STATUS ================== //
const updateOrderStatus = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin") {
    res.status(403);
    throw new Error("Only admin can update order status");
  }

  const { status } = req.body;

  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  order.status = status || order.status;

  // ✅ Auto set deliveredAt
  if (status === "delivered") {
    order.deliveredAt = Date.now();
  }

  await order.save();

  res.status(200).json({
    success: true,
    message: "Order status updated",
    order,
  });
});

// ================== DELETE ORDER ================== //
const deleteOrder = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin") {
    res.status(403);
    throw new Error("Only admin can delete orders");
  }

  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  await order.deleteOne();

  res.status(200).json({
    success: true,
    message: "Order deleted successfully",
  });
});

module.exports = {
  createOrder,
  getMyOrders,
  getAllOrders,
  getSingleOrder,
  updateOrderStatus,
  deleteOrder,
};
