const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const cookieOptions = require("../utils/cookieOptions");

// ================= REGISTER USER =================
const register = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;
        
        // 1. Check user exists
        const userExist = await User.findOne({ email });

        if (userExist) {
            return res.status(400).json({ message: "User already exists" });
        }

        // 2. Create user
        const user = await User.create({
            name, email, password, phone
        });

        // 3. Generate JWT
        const token = generateToken(user._id);

        // 3. Send Cookie
        res.cookie("token", token, cookieOptions);

        // 4. Send response
        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        })
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

