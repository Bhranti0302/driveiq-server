const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add your name"],
      trim: true,
      minlength: [3, "Name must be at least 3 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },

    email: {
      type: String,
      required: [true, "Please add your email"],
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please add a valid email address"],
    },

    phone: {
      type: String,
      trim: true,
      match: [/^[0-9]{10}$/, "Please add a valid 10-digit phone number"],
      default: null,
    },

    subject: {
      type: String,
      required: [true, "Please add a subject"],
      trim: true,
      maxlength: [100, "Subject cannot exceed 100 characters"],
    },

    message: {
      type: String,
      required: [true, "Please add your message"],
      trim: true,
      minlength: [10, "Message must be at least 10 characters"],
      maxlength: [2000, "Message cannot exceed 2000 characters"],
    },

    status: {
      type: String,
      enum: ["pending", "in-progress", "resolved"],
      default: "pending",
    },

    adminReply: {
      type: String,
      trim: true,
      default: "",
      maxlength: [2000, "Reply cannot exceed 2000 characters"],
    },

    repliedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Fetch latest contact inquiries
contactSchema.index({ createdAt: -1 });

// Filter inquiries by status
contactSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("Contact", contactSchema);
