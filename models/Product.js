const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    description: {
      type: String,
      required: true,
    },

    longDescription: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    quantity: {
      type: Number,
      default: 1,
    },

    category: {
      type: String,
      enum: ["car", "part"],
      required: true,
    },

    brand: {
      type: String,
      required: true,
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

    mainImage: {
      url: String,
      public_id: String,
    },

    images: [
      {
        url: String,
        public_id: String,
      },
    ],
  },
  { timestamps: true },
);

// Indexes
productSchema.index(
  { name: 1, dealer: 1 },
  { unique: true, collation: { locale: "en", strength: 2 } },
);

module.exports = mongoose.model("Product", productSchema);
