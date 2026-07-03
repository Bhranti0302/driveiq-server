const express = require("express");

const { register, login, logout } = require("../controllers/authController");

const router = express.Router();

// =============== PUBLIC ROUTES ===============

router.post("/register", register);
router.post("/login", login);

// =============== PROTECTED ROUTES ===============

router.get("/logout", logout);

module.exports = router;