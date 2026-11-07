const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "Please add coupon code"],
      unique: true,
      trim: true,
      uppercase: true,
      minlength: [3, "Coupon code must be at least 3 characters"],
      maxlength: [20, "Coupon code cannot exceed 20 characters"],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [200, "Description cannot exceed 200 characters"],
    },

    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: [true, "Please select discount type"],
    },

    discountValue: {
      type: Number,
      required: [true, "Please add discount value"],
      min: [0.01, "Discount must be greater than zero"],
    },

    maxDiscount: {
      type: Number,
      min: [0, "Maximum discount cannot be negative"],
      default: null,
    },

    minOrderAmount: {
      type: Number,
      min: [0, "Minimum order amount cannot be negative"],
      default: 0,
    },

    usageLimit: {
      type: Number,
      min: [1, "Usage limit must be at least 1"],
      default: null,
    },

    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    startDate: {
      type: Date,
      required: [true, "Please add coupon start date"],
    },

    expiryDate: {
      type: Date,
      required: [true, "Please add coupon expiry date"],
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

// Validate discount values and date range
couponSchema.pre("validate", function () {
  if (this.discountType === "percentage" && this.discountValue > 100) {
    this.invalidate("discountValue", "Percentage discount cannot exceed 100");
  }

  if (this.discountType === "fixed" && this.maxDiscount !== null) {
    this.invalidate(
      "maxDiscount",
      "Maximum discount is only applicable to percentage coupons",
    );
  }

  if (this.startDate && this.expiryDate && this.expiryDate <= this.startDate) {
    this.invalidate("expiryDate", "Expiry date must be after start date");
  }

  if (this.usedCount > (this.usageLimit ?? Infinity)) {
    this.invalidate("usedCount", "Used count cannot exceed usage limit");
  }
});

module.exports = mongoose.model("Coupon", couponSchema);
