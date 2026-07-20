const mongoose = require("mongoose");

// 🔹 Cart Item Schema (for each product in cart)
const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: { // User's selected quantity
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },
  },
  { _id: false }, // optional: prevents extra _id for each item
);

// 🔹 Main Cart Schema
const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // one cart per user
    },
    items: [cartItemSchema],

    cartTotal: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

cartSchema.pre("save", async function (next) {
  try {
    const productIds = this.items.map((item) => item.product);

    const products = await Product.find({
      _id: { $in: productIds },
    }).select("price");

    const productMap = {};

    products.forEach((p) => {
      productMap[p._id.toString()] = p.price;
    });

    let total = 0;

    this.items.forEach((item) => {
      const price = productMap[item.product.toString()];
      if (!price) return;

      total += price * item.quantity;
    });

    this.cartTotal = total;

    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("Cart", cartSchema);
