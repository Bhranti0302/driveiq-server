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

// ================= LOGIN USER =================
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Check user exists
        const user = await User.findOne({ email }).select("+password");
        
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // 2. Check password
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // 3. Status online
        user.status = "online";
        user.lastSeen = null;
        await user.save();

        // 3. Generate JWT
        const token = generateToken(user._id);

        // 4. Send Cookie
        res.cookie("token", token, cookieOptions);

        // 5. Send response
        res.json({
            message: "Login successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                status: user.status
            },
        })
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// ================ LOGOUT USER =================
const logout = async (req, res) => {
    try {
        const token = req.cookies.token;

        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            await User.findByIdAndUpdate(decoded.id, {
                status: "offline",
                lastSeen: new Date(),
            });
        }

        res.clearCookie("token");

        res.json({ message: "Logged out successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}