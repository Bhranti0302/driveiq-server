const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
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

    quantity: { // Available stock
      type: Number,
      required: true,
      default: 1,
    },

    images: {
      type: [String],
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
      type: mongoose.Schema.Types.Mixed, 
      default: {},
    },

    dealer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "active", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
);

// Better unique index (case-insensitive)
productSchema.index(
  { name: 1 },
  { unique: true, collation: { locale: "en", strength: 2 } },
);

module.exports = mongoose.model("Product", productSchema);
