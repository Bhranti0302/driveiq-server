const asyncHandler = require("./../utils/asyncHandler");
const User = require("../models/User");

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
