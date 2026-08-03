const asyncHandler = require("./../utils/asyncHandler");
const User = require("../models/User");
const Product = require("../models/Product");
const bcrypt = require("bcryptjs");
const cloudinary = require("../utils/cloudinary");

// User

// ******************************************************//

// ================== Get All User ================== //
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ role: "user" }).select("-password");

  res.status(200).json({
    count: users.length,
    users,
  });
});

// ================ Upload Profile Picture ================ //
const uploadProfileImage = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!req.file) {
    return res.status(400).json({ message: "No image uploaded" });
  }

  // 🔥 Delete old image if exists
  if (user.profileImage?.public_id) {
    await cloudinary.uploader.destroy(user.profileImage.public_id);
  }

  // Save new image
  user.profileImage = {
    url: req.file.path,
    public_id: req.file.filename,
  };

  await user.save();

  res.json({
    message: "Profile image updated",
    profileImage: user.profileImage,
  });
});

// ================ Delete Profile Picture ================ //
const deleteProfileImage = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user.profileImage?.public_id) {
    return res.status(400).json({ message: "No image to delete" });
  }

  await cloudinary.uploader.destroy(user.profileImage.public_id);

  user.profileImage = {};
  await user.save();

  res.json({
    message: "Profile image deleted",
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
});

// ******************************************************//

// Dealer

// ******************************************************//

// ============== Get All Dealers ============== //
const getAllDealers = asyncHandler(async (req, res) => {
  const users = await User.find({ role: "dealer" }).select("-password");

  res.status(200).json({
    count: users.length,
    users,
  });
});

// ******************************************************//

// Dealer create, update and delete by admin

// ******************************************************//

// ================== Create dealer By Admin ================== //
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

// ================ Update Dealer By Admin ================ //
const updateDealerByAdmin = asyncHandler(async (req, res) => {
  const dealer = await User.findById(req.params.id);

  if (!dealer || dealer.role !== "dealer") {
    res.status(404);
    throw new Error("Dealer not found");
  }

  // ✅ Update allowed fields only
  dealer.name = req.body.name || dealer.name;
  dealer.email = req.body.email || dealer.email;
  dealer.phone = req.body.phone || dealer.phone;

  const updatedDealer = await dealer.save();

  res.status(200).json({
    success: true,
    message: "Dealer updated successfully",
    data: {
      id: updatedDealer._id,
      name: updatedDealer.name,
      email: updatedDealer.email,
      phone: updatedDealer.phone,
      role: updatedDealer.role,
    },
  });
});

// ================ Delete Dealer By Admin ================ //
const deleteDealerByAdmin = asyncHandler(async (req, res) => {
  const dealer = await User.findById(req.params.id);

  if (!dealer || dealer.role !== "dealer") {
    res.status(404);
    throw new Error("Dealer not found");
  }

  // Delete all Products of dealer
  await Product.deleteMany({ dealer: dealer._id });

  // ✅ Delete dealer
  await dealer.deleteOne();

  res.status(200).json({
    success: true,
    message: "Dealer deleted successfully",
  });
});
// ******************************************************//

// Logged dealer can update and delete

// ******************************************************//

// =========== Update Own Dealer Profile =========== //
const updateOwnDealerProfile = asyncHandler(async (req, res) => {
  if (req.user.role !== "dealer") {
    res.status(403);
    throw new Error("Only dealers can update their profile");
  }

  const dealer = await User.findById(req.user._id);

  if (!dealer) {
    res.status(404);
    throw new Error("Dealer not found");
  }

  const { name, email, phone } = req.body || {};

  if (name) dealer.name = name;
  if (email) dealer.email = email;
  if (phone) dealer.phone = phone;

  const updatedDealer = await dealer.save();

  res.status(200).json({
    success: true,
    message: "Dealer profile updated successfully",
    data: {
      id: updatedDealer._id,
      name: updatedDealer.name,
      email: updatedDealer.email,
      phone: updatedDealer.phone,
      role: updatedDealer.role,
    },
  });
});

// =========== Delete Own Dealer Profile =========== //
const deleteOwnDealerAccount = asyncHandler(async (req, res) => {
  if (req.user.role !== "dealer") {
    res.status(403);
    throw new Error("Only dealers can delete their account");
  }

  const dealer = await User.findById(req.user._id);

  if (!dealer) {
    res.status(404);
    throw new Error("Dealer not found");
  }

  // Delete all Products of dealer
  await Product.deleteMany({ dealer: dealer._id });

  await dealer.deleteOne();

  res.status(200).json({
    success: true,
    message: "Dealer account deleted successfully",
  });
});

module.exports = {
  createDealer,
  updateUserProfile,
  deleteUserAccount,
  getAllUsers,
  getAllDealers,
  updateDealerByAdmin,
  deleteDealerByAdmin,
  updateOwnDealerProfile,
  deleteOwnDealerAccount,
  uploadProfileImage,
  deleteProfileImage,
};