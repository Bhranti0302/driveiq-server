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
  },
  { timestamps: true },
);

module.exports = mongoose.model("Cart", cartSchema);
