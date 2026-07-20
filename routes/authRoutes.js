const express = require("express");

const { register, login, logout } = require("../controllers/authController");

const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

// =============== PUBLIC ROUTES ===============

// Role => User Register
router.post("/register", register);

// Role => User Login
router.post("/login", login);

// =============== PROTECTED ROUTES ===============

// Role => All Role logout 
router.get("/logout", logout);

// Role => All Role get user details
router.get("/me", protect, (req, res) => {
    res.status(200).json(req.user);
});

module.exports = router;