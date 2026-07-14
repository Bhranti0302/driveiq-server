const asyncHandler = require("./../utils/asyncHandler");
const User = require("../models/User");

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

module.exports = {
  createDealer,
};

// ================ Update product ================ //
exports.updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // ✅ Update fields safely
  user.name = req.body.name || user.name;
  user.email = req.body.email || user.email;

  // ✅ Password update (if provided)
  if (req.body.password) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);
  }

  const updatedUser = await user.save();

  res.status(200).json({
    success: true,
    message: "User profile updated",
    data: {
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
    },
  });
});
