const mongoose = require("mongoose");
const Product = require("./Product");

// Cart Item Schema
const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product is required"],
    },

    quantity: {
      type: Number,
      required: true,
      default: 1,
      min: [1, "Quantity must be at least 1"],
      validate: {
        validator: Number.isInteger,
        message: "Quantity must be a whole number",
      },
    },
  },
  { _id: false },
);

// Main Cart Schema
const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    items: {
      type: [cartItemSchema],
      default: [],
    },

    cartTotal: {
      type: Number,
      default: 0,
      min: [0, "Cart total cannot be negative"],
    },
  },
  {
    timestamps: true,
  },
);

// Calculate cart total before saving
cartSchema.pre("save", async function () {
  if (this.items.length === 0) {
    this.cartTotal = 0;
    return;
  }

  const productIds = this.items.map((item) => item.product);

  const products = await Product.find({
    _id: { $in: productIds },
    status: "active",
  }).select("price quantity");

  const productMap = new Map(
    products.map((product) => [product._id.toString(), product]),
  );

  let total = 0;

  for (const item of this.items) {
    const product = productMap.get(item.product.toString());

    if (!product) {
      throw new Error("One or more products are unavailable");
    }

    if (item.quantity > product.quantity) {
      throw new Error(`Only ${product.quantity} units are available`);
    }

    total += product.price * item.quantity;
  }

  this.cartTotal = Math.round((total + Number.EPSILON) * 100) / 100;
});

module.exports = mongoose.model("Cart", cartSchema);
