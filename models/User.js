const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
      trim: true,
      minlength: [3, "Name must be at least 3 characters"],
      maxlength: [20, "Name cannot exceed 20 characters"],
    },

    email: {
      type: String,
      required: [true, "Please add an email"],
      unique: true,
      lowercase: true, // 🔥 important
      trim: true,
      index: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please add a valid email",
      ],
    },

    password: {
      type: String,
      required: [true, "Please add a password"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
      match: [
        /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&]).{6,}$/,
        "Password must contain at least one letter, one number, and one special character",
      ],
    },

    role: {
      type: String,
      enum: ["user", "dealer", "admin"],
      default: "user",
    },

    phone: {
      type: String,
      trim: true,
      default: null,
      unique: true,
      sparse: true, 
      match: [
        /^[6-9]\d{9}$/,
        "Please enter a valid 10-digit Indian phone number",
      ],
    },

    status: {
      type: String,
      enum: ["online", "offline"],
      default: "offline",
    },

    lastSeen: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// 🔐 HASH PASSWORD
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return; 

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// 🔑 COMPARE PASSWORD
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// 🔥Hide Password
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model("User", userSchema);
