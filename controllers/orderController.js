const asyncHandler = require("../utils/asyncHandler");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Order = require("../models/Order");

// ================== CREATE ORDER ================== //
const createOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod } = req.body || {};

  // 🔒 Validation
  if (!shippingAddress) {
    return res.status(400).json({
      message: "Shipping address is required",
    });
  }

  // 🛒 Get user's cart
  const cart = await Cart.findOne({ user: req.user._id }).populate(
    "items.product",
  );

  // ❌ If cart empty
  if (!cart || cart.items.length === 0) {
    return res.status(400).json({
      message: "Cart is empty",
    });
  }

  // 📦 Create order items
  const orderItems = [];

  for (const item of cart.items) {
    const product = item.product;

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    // ❌ Stock check
    if (product.stock < item.quantity) {
      return res.status(400).json({
        message: `Not enough stock for ${product.name}`,
      });
    }

    // ✅ Push order item
    orderItems.push({
      product: product._id,
      name: product.name,
      price: product.price,
      quantity: item.quantity,
      image: product.image,
      color: "default",
    });

    // 🔻 Reduce stock
    product.stock -= item.quantity;
    await product.save();
  }

  // 💰 Create Order
  const order = await Order.create({
    user: req.user._id,
    orderItems,
    shippingAddress,
    paymentMethod,
    totalPrice: cart.cartTotal,
  });

  // 🧹 Clear cart
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

  const page = Number(req.query.page) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;

  const orders = await Order.find()
    .populate("user", "name email")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const totalOrders = await Order.countDocuments();

  // 💰 Total revenue
  const totalRevenue = await Order.aggregate([
    { $match: { status: { $ne: "cancelled" } } },
    { $group: { _id: null, total: { $sum: "$totalPrice" } } },
  ]);

  res.status(200).json({
    success: true,
    count: orders.length,
    totalOrders,
    totalRevenue: totalRevenue[0]?.total || 0,
    page,
    pages: Math.ceil(totalOrders / limit),
    orders,
  });
});

// ================== GET SINGLE ORDER ================== //
const getSingleOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("user", "name email")
    .populate("orderItems.product", "name price image");

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  // 🔐 Owner or admin only
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

  const validStatuses = [
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      message: "Invalid order status",
    });
  }

  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  order.status = status;

  // ⏱️ timestamps
  if (status === "delivered") {
    order.deliveredAt = Date.now();
  }

  if (status === "confirmed") {
    order.isPaid = true;
    order.paidAt = Date.now();
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

  // ❌ Prevent deleting delivered orders
  if (order.status === "delivered") {
    return res.status(400).json({
      message: "Delivered orders cannot be deleted",
    });
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
