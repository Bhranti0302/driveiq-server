const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const cookieOptions = require("../utils/cookieOptions");
const asyncHandler = require("./../utils/asyncHandler");
const jwt = require("jsonwebtoken");

// ============ REGISTER USER ============ //
const register = asyncHandler(async (req, res) => {
    const { name, email, password, phone } = req.body;

    // 1. Check user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
        return res.status(400).json({
            message: "User already exists"
        })
    }

    // 2. Create User
    const user = await User.create({
        name,
        email,
        password,
        phone
    })

    // 3. Generate token 
    const token = generateToken(user._id);

    // 4. Send Cookies
    res.cookie("token", token, cookieOptions);
    
    // 5. Send Response
    res.status(201).json({
        message: "User registered successfully",
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            status: user.status
        }
    })
})