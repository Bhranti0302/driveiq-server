const asyncHandler = require("./../utils/asyncHandler");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

// ================== Create dealer ================== //
const createDealer = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  const dealer = await User.create({
    name,
    email,
    password,
    phone,
    role: "dealer", // 🔥 force dealer
  });

  res.status(201).json({
    message: "Dealer created successfully",
    dealer,
  });
});



// ================ Update product ================ //
const updateUserProfile = asyncHandler(async (req, res) => {
  // ❗ Only normal users allowed
  if (req.user.role !== "user") {
    res.status(403);
    throw new Error("Only users can update their profile");
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // ✅ Update allowed fields only
  user.name = req.body.name || user.name;
  user.email = req.body.email || user.email;
  user.phone = req.body.phone || user.phone;

  const updatedUser = await user.save();

  res.status(200).json({
    success: true,
    message: "User profile updated successfully",
    data: {
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      role: updatedUser.role,
    },
  });
});

const deleteUserAccount = asyncHandler(async (req, res) => {
  // ❗ Only normal users allowed
  if (req.user.role !== "user") {
    res.status(403);
    throw new Error("Only users can delete their account");
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // ✅ Delete user
  await user.deleteOne();

  res.status(200).json({
    success: true,
    message: "User account deleted successfully",
  });
 })


module.exports = {
  createDealer,
  updateUserProfile,
  deleteUserAccount
};