const express = require("express");
const { sendVerificationOTP, verifyEmailOTP } = require("../controllers/emailVerificationController");

const router = express.Router();

// Send OTP to email
router.post("/send-otp", sendVerificationOTP);
router.post("/verify-otp", verifyEmailOTP);

module.exports = router;