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
      min: 0,
    },

    quantity: {
      type: Number,
      required: true,
      default: 1,
      min: 0,
    },

    mainImage: {
      url: { type: String, default: "" },
      public_id: { type: String, default: "" },
    },

    images: [
      {
        url: { type: String, default: "" },
        public_id: { type: String, default: "" },
      },
    ],

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

    slug: {
      type: String,
      lowercase: true,
    },
  },
  {
    timestamps: true,
  },
);

// ✅ Unique per dealer (IMPORTANT FIX)
productSchema.index(
  { name: 1, dealer: 1 },
  { unique: true, collation: { locale: "en", strength: 2 } },
);

// ✅ Performance indexes
productSchema.index({ dealer: 1 });
productSchema.index({ category: 1 });
productSchema.index({ status: 1 });

module.exports = mongoose.model("Product", productSchema);
