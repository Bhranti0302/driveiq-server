const asyncHandler = require("./../utils/asyncHandler");
const Cart = require("./../models/Cart");
const Product = require("./../models/Product");
const Order = require("./../models/Order");

const createOrder = asyncHandler(async (req, res) => {
  if (req.user.role !== "user") {
    res.status(403);
    throw new Error("Only users can create an order");
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

  for (const item of cart.items) {
    const product = item.product;

    if (product.quantity < item.quantity) {
      res.status(400);
      throw new Error("Not enough stock available");
    }

    product.quantity -= item.quantity;
    await product.save();

    orderItems.push({
      product: product._id,
      name: product.name,
      price: product.price,
      quantity: item.quantity,
      image: product.image,
    });

    totalPrice += product.price * item.quantity;
  }

  const order = await Order.create({
    user: req.user._id,
    orderItems,
    totalPrice,
  });
    
    // Clear cart after order
    cart.items = [];
    cart.cartTotal = 0;
    await cart.save();

    res.status(200).json({
        success: true,
        message: "Order created successfully",
        order,
    });
});

module.exports = { createOrder };
