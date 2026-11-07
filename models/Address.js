const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    fullName: {
      type: String,
      required: [true, "Please add full name"],
      trim: true,
      minlength: [3, "Name must be at least 3 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },

    phone: {
      type: String,
      required: [true, "Please add phone number"],
      match: [/^[0-9]{10}$/, "Please add a valid 10-digit phone number"],
    },

    addressLine1: {
      type: String,
      required: [true, "Please add address"],
      trim: true,
    },

    addressLine2: {
      type: String,
      trim: true,
      default: "",
    },

    city: {
      type: String,
      required: [true, "Please add city"],
      trim: true,
    },

    state: {
      type: String,
      required: [true, "Please add state"],
      trim: true,
    },

    postalCode: {
      type: String,
      required: [true, "Please add postal code"],
      trim: true,
    },

    country: {
      type: String,
      required: [true, "Please add country"],
      trim: true,
      default: "India",
    },

    addressType: {
      type: String,
      enum: ["home", "work", "other"],
      default: "home",
    },

    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// Index for fetching a user's addresses
addressSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("Address", addressSchema);
