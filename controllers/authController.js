const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const cookieOptions = require("../utils/cookieOptions");
const asyncHandler = require("../utils/asyncHandler");

// ============ REGISTER USER ============ //
const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body || {};

  // 1. Validate required fields
  if (!name || !email || !password) {
    return res.status(400).json({
      message: "Name, email and password are required",
    });
  }

  // 2. Normalize email
  const normalizedEmail = email.trim().toLowerCase();

  // 3. Check if user already exists
  const userExists = await User.findOne({
    email: normalizedEmail,
  });

  if (userExists) {
    return res.status(409).json({
      message: "User already exists",
    });
  }

  // 4. Create user
  const user = await User.create({
    name,
    email: normalizedEmail,
    password,
    phone,
  });

  // 5. Generate token
  const token = generateToken(user._id);

  // 6. Set authentication cookie
  res.cookie("token", token, cookieOptions);

  // 7. Send response
  res.status(201).json({
    message: "User registered successfully",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
  });
});

// ============ LOGIN USER ============ //
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};

  // 1. Validate input
  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password are required",
    });
  }

  // 2. Normalize email
  const normalizedEmail = email.trim().toLowerCase();

  // 3. Find user and include password
  const user = await User.findOne({
    email: normalizedEmail,
  }).select("+password");

  if (!user) {
    return res.status(401).json({
      message: "Invalid email or password",
    });
  }

  // 4. Compare password
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return res.status(401).json({
      message: "Invalid email or password",
    });
  }

  // 5. Generate token
  const token = generateToken(user._id);

  // 6. Set authentication cookie
  res.cookie("token", token, cookieOptions);

  // 7. Send response
  res.status(200).json({
    message: "User logged in successfully",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
  });
});

// ============ LOGOUT USER ============ //
const logout = asyncHandler(async (req, res) => {
  // Use the same cookie settings when clearing the cookie.
  const { maxAge, expires, ...clearCookieOptions } = cookieOptions;

  res.clearCookie("token", clearCookieOptions);

  res.status(200).json({
    message: "User logged out successfully",
  });
});

module.exports = {
  register,
  login,
  logout,
};
