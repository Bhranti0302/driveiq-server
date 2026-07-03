const express = require("express");

const { register, login, logout } = require("../controllers/authController");

const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

// =============== PUBLIC ROUTES ===============

router.post("/register", register);
router.post("/login", login);

// =============== PROTECTED ROUTES ===============

router.get("/logout", logout);
router.get("/me", protect, (req, res) => {
    res.status(200).json(req.user);
});

module.exports = router;