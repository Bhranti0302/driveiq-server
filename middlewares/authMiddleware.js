const jwt = require("jsonwebtoken");
const User = require("../models/User");
const asyncHandler = require("./../utils/asyncHandler");

const protect = asyncHandler(async (req, res, next) => { 
    const token = req.cookies.token;

    // 1. Check if token exists
    if (!token) {
        res.status(401).json({
            message: "Not authorized, no token"
        })
    }

    // 2. Verify token
    const decodedId = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Check if user exists
    const user = await User.findById(decodedId.userId);

    if (!user) {
        res.status(401).json({
            message: "Not authorized, user not found"
        })
    }

    req.user = user;
    next();
})

module.exports = { protect };
    