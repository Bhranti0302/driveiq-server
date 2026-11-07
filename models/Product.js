const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add product name"],
      trim: true,
      minlength: [2, "Product name must be at least 2 characters"],
      maxlength: [150, "Product name cannot exceed 150 characters"],
    },

    description: {
      type: String,
      required: [true, "Please add product description"],
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },

    longDescription: {
      type: String,
      required: [true, "Please add detailed description"],
      trim: true,
    },

    price: {
      type: Number,
      required: [true, "Please add product price"],
      min: [0.01, "Price must be greater than zero"],
    },

    quantity: {
      type: Number,
      default: 1,
      min: [0, "Quantity cannot be negative"],
      validate: {
        validator: Number.isInteger,
        message: "Quantity must be a whole number",
      },
    },

    category: {
      type: String,
      enum: ["car", "part"],
      required: [true, "Please select product category"],
    },

    brand: {
      type: String,
      required: [true, "Please add brand"],
      trim: true,
    },

    specifications: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    dealer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Dealer reference is required"],
    },

    status: {
      type: String,
      enum: ["pending", "active", "rejected"],
      default: "pending",
    },

    mainImage: {
      url: {
        type: String,
        default: "",
      },
      public_id: {
        type: String,
        default: "",
      },
    },

    images: [
      {
        url: {
          type: String,
          required: true,
        },
        public_id: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

// Prevent duplicate product names for the same dealer
productSchema.index(
  { name: 1, dealer: 1 },
  {
    unique: true,
    collation: {
      locale: "en",
      strength: 2,
    },
  },
);

module.exports = mongoose.model("Product", productSchema);
