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
      default: 1,
    },

    images: {
      type: [String], // multiple images
      default: [],
    },

    category: {
      type: String,
      enum: ["car", "part"],
      required: true,
    },

    brand: {
      type: String,
      required: true,
      trim: true,
    },

    specifications: {
      type: Object, // flexible JSON
      default: {},
    },

    dealer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    status: {
      type: String,
      enum: ["active", "banned"],
      default: "active",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Product", productSchema);
