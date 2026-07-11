const jwt = require("jsonwebtoken");
const User = require("../models/User");
const asyncHandler = require("./../utils/asyncHandler");

const protect = asyncHandler(async (req, res, next) => { 
    const token;

    // 1. Get token from header or cookie
    if (req.cookies.token) {
        token = req.cookies.token;
    } else if(req.headers.authorization?.startsWith("Bearer ")) {
        token = req.headers.authorization.split(" ")[1];
    }
    // 2. Check if token exists
    if (!token) {
        res.status(401).json({
            message: "Not authorized, no token"
        })
    }

    try {
        // 3. Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 4. Get user
        const user = await User.findById(decoded.userId).select("-password");

        // 5. Check if user exists
        if (!user) {
            res.status(401).json({
                message: "Not authorized, user not found"
            })
        }

        // 6. Attach user
        req.user = user;

        next();
        
    }catch (error) {
        res.status(401).json({
            message: "Not authorized, token failed"
        })
    }

})

module.exports = { protect };
    