const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: [true, "Order is required"],
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },

    paymentMethod: {
      type: String,
      enum: ["cod", "card", "upi", "netbanking", "wallet"],
      required: [true, "Please select payment method"],
    },

    paymentGateway: {
      type: String,
      enum: ["razorpay", "stripe", "cashfree", "none"],
      default: "none",
    },

    transactionId: {
      type: String,
      trim: true,
      default: null,
    },

    gatewayOrderId: {
      type: String,
      trim: true,
      default: null,
    },

    amount: {
      type: Number,
      required: [true, "Payment amount is required"],
      min: [0.01, "Payment amount must be greater than zero"],
    },

    currency: {
      type: String,
      uppercase: true,
      default: "INR",
    },

    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed", "refunded"],
      default: "pending",
    },

    paidAt: {
      type: Date,
      default: null,
    },

    failureReason: {
      type: String,
      trim: true,
      default: null,
    },

    refundId: {
      type: String,
      trim: true,
      default: null,
    },

    refundedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Useful indexes for payment lookups
paymentSchema.index({ user: 1, createdAt: -1 });
paymentSchema.index({ order: 1 });

module.exports = mongoose.model("Payment", paymentSchema);
