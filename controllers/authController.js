const User = require("../models/User");
const Admin = require("../models/Admin");
const Dealer = require("../models/Dealer");

const asyncHandler = require("../utils/asyncHandler");
const createError = require("../utils/createError");

// @desc    Register a new user
// @route   POST /api/auth/register/user
// @access  Public

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  // 1. Validate required fields
  if (!name || !email || !password || !phone) {
    throw createError("Please provide all required fields", 400);
  }

  // 2. Check whether email already exists
  const existingUser = await User.findOne({ email });
  const existingDealer = await Dealer.findOne({ email });
  const existingAdmin = await Admin.findOne({ email });

  if (existingUser || existingDealer || existingAdmin) {
    throw createError("An account with this email already exists", 409);
  }

  // 3. Create user
  const user = await User.create({
    name,
    email,
    password,
    phone,
  });

  // 4. Send response
  res.status(201).json({
    success: true,
    message: "User registered successfully. Please verify your email.",
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      isEmailVerified: user.isEmailVerified,
    },
  });
});

// @desc    Register a new dealer
// @route   POST /api/auth/register/dealer
// @access  Public

const registerDealer = asyncHandler(async (req, res) => {
    const {
        name,
        email,
        password,
        phone,
        businessName,
        businessType,
        gstNumber,
        registrationNumber,
        businessAddress,
    } = req.body;

    // 1. Validate required fields
    if (
        !name ||
        !email ||
        !password ||
        !phone ||
        !businessName ||
        !businessType ||
        !businessAddress
    ) {
        throw createError("Please provide all required fields", 400);
    }

    // 2. Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // 3. Check email across all account collections
    const existingUser = await User.findOne({ email: normalizedEmail });
    const existingDealer = await Dealer.findOne({ email: normalizedEmail });
    const existingAdmin = await Admin.findOne({ email: normalizedEmail });

    if (existingUser || existingDealer || existingAdmin) {
        throw createError("An account with this email already exists", 409);
    }

    // 4. Validate business type
    const allowedBusinessTypes = ["company", "independent"];

    if (!allowedBusinessTypes.includes(businessType)) {
        throw createError("Invalid business type", 400);
    }

    // 5. Create dealer
    const dealer = await Dealer.create({
        name,
        email: normalizedEmail,
        password,
        phone,
        businessName,
        businessType,
        gstNumber,
        registrationNumber,
        businessAddress,
    });

    // 6. Send response
    res.status(201).json({
        success: true,
        message: "Dealer registered successfully. Please verify your email.",
        data: {
            id: dealer._id,
            name: dealer.name,
            email: dealer.email,
            businessName: dealer.businessName,
            businessType: dealer.businessType,
            approvalStatus: dealer.approvalStatus,
            isEmailVerified: dealer.isEmailVerified,
        },
    });
});

module.exports = {
    registerUser,
    registerDealer
};
