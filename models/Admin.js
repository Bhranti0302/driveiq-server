const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Admin name is required"],
      trim: true,
      minlength: [5, "Minimum 5 characters are required"],
      maxlength: [100, "Maximum 100 characters allowed"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      unique: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email"],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Minimum 8 characters are required"],
      match: [
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character",
      ],
      select: false,
    },

    phone: {
      type: String,
      trim: true,
      match: [
        /^[6-9]\d{9}$/,
        "Please provide a valid 10-digit Indian mobile number",
      ],
    },

    profilePicture: {
      type: String,
      default: "",
    },

    profilePicturePublicId: {
      type: String,
      default: "",
    },

    role: {
      type: String,
      enum: ["admin", "superAdmin"],
      default: "admin",
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Hash password before saving
adminSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(12);

  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password during login
adminSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const Admin = mongoose.model("Admin", adminSchema);

module.exports = Admin;
