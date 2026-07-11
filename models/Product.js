const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
      trim: true,
      minlength: 3,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    longDescription: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    price: {
      type: Number,
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
    },

    images: [String], // ✅ multiple images

    category: {
      type: String,
      enum: ["car", "part"], // ✅ controlled
      required: true,
    },

    brand: {
      type: String,
      required: true,
      trim: true,
    },

    dealer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // ✅ important
    },

    rating: {
      type: Number,
      default: 0,
    },

    numReviews: {
      type: Number,
      default: 0,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    // 🔥 YOUR REQUIREMENT IMPLEMENTED HERE
    specifications: [
      {
        key: String,
        value: String,
      },
    ],
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Product", productSchema);
