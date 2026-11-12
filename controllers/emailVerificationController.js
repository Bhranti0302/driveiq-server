const User = require("../models/User");
const Dealer = require("../models/Dealer");
const EmailVerification = require("../models/EmailVerification");

const asyncHandler = require("../utils/asyncHandler");
const generateOTP = require("../utils/generateOTP");
const hashOTP = require("../utils/hashOTP");
const sendEmail = require("../utils/sendEmail");

// OTP configuration
const OTP_EXPIRY = 5 * 60 * 1000; // 5 minutes
const RESEND_COOLDOWN = 60 * 1000; // 60 seconds
const MAX_ATTEMPTS = 5;

// Helper: create errors compatible with errorMiddleware
const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

// Helper: get the correct account model
const getAccountModel = (accountType) => {
  if (accountType === "user") return User;
  if (accountType === "dealer") return Dealer;

  throw createError("Invalid account type", 400);
};

// ==========================================
// SEND EMAIL VERIFICATION OTP
// ==========================================

const sendVerificationOTP = asyncHandler(async (req, res) => {
  const { email, accountType } = req.body;

  // Validate required fields
  if (!email || !accountType) {
    throw createError("Email and account type are required", 400);
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Get account model
  const Account = getAccountModel(accountType);

  // Check whether account exists
  const account = await Account.findOne({
    email: normalizedEmail,
  });

  if (!account) {
    throw createError("Account not found. Please register first.", 404);
  }

  // Check whether email is already verified
  if (account.isEmailVerified) {
    throw createError("Email is already verified", 400);
  }

  // Find existing OTP record
  let verification = await EmailVerification.findOne({
    email: normalizedEmail,
    accountType,
  });

  // Check resend cooldown
  if (verification) {
    const timeSinceLastSent = Date.now() - verification.lastSentAt.getTime();

    if (timeSinceLastSent < RESEND_COOLDOWN) {
      const remainingSeconds = Math.ceil(
        (RESEND_COOLDOWN - timeSinceLastSent) / 1000,
      );

      throw createError(
        `Please wait ${remainingSeconds} seconds before requesting another OTP`,
        429,
      );
    }
  }

  // Generate and hash OTP
  const otp = generateOTP();
  const otpHash = hashOTP(otp);

  // Save OTP in database
  const expiresAt = new Date(Date.now() + OTP_EXPIRY);

  if (verification) {
    verification.otpHash = otpHash;
    verification.expiresAt = expiresAt;
    verification.attempts = 0;
    verification.lastSentAt = new Date();

    await verification.save();
  } else {
    await EmailVerification.create({
      email: normalizedEmail,
      accountType,
      otpHash,
      expiresAt,
      attempts: 0,
      lastSentAt: new Date(),
    });
  }

  // Send OTP email
  await sendEmail({
    to: normalizedEmail,
    subject: "Verify Your DriveIQ Email",
    html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2>Welcome to DriveIQ!</h2>

                <p>
                    Use the following OTP to verify your email address.
                </p>

                <h1 style="letter-spacing: 8px; color: #2563eb;">
                    ${otp}
                </h1>

                <p>This OTP is valid for 5 minutes.</p>

                <p>
                    If you did not request this verification,
                    please ignore this email.
                </p>

                <p>Thank you,<br/>DriveIQ Team</p>
            </div>
        `,
    text: `Your DriveIQ verification OTP is ${otp}. It is valid for 5 minutes.`,
  });

  res.status(200).json({
    success: true,
    message: "Verification OTP sent successfully",
  });
});

// ==========================================
// VERIFY EMAIL OTP
// ==========================================

const verifyEmailOTP = asyncHandler(async (req, res) => {
  const { email, otp, accountType } = req.body;

  // Validate required fields
  if (!email || !otp || !accountType) {
    throw createError("Email, OTP and account type are required", 400);
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Validate account type
  const Account = getAccountModel(accountType);

  // Find OTP record
  const verification = await EmailVerification.findOne({
    email: normalizedEmail,
    accountType,
  }).select("+otpHash");

  if (!verification) {
    throw createError("OTP not found. Please request a new OTP.", 404);
  }

  // Check OTP expiry
  if (verification.expiresAt.getTime() <= Date.now()) {
    await verification.deleteOne();

    throw createError("OTP has expired. Please request a new OTP.", 400);
  }

  // Check maximum attempts
  if (verification.attempts >= MAX_ATTEMPTS) {
    await verification.deleteOne();

    throw createError(
      "Maximum OTP attempts exceeded. Please request a new OTP.",
      429,
    );
  }

  // Increment verification attempts
  verification.attempts += 1;

  // Compare submitted OTP with stored hash
  const submittedOTPHash = hashOTP(otp);

  if (submittedOTPHash !== verification.otpHash) {
    await verification.save();

    throw createError("Invalid OTP. Please try again.", 400);
  }

  // Find account and mark email as verified
  const account = await Account.findOneAndUpdate(
    { email: normalizedEmail },
    { $set: { isEmailVerified: true } },
    { new: true },
  );

  if (!account) {
    throw createError("Account not found", 404);
  }

  // Delete OTP after successful verification
  await verification.deleteOne();

  res.status(200).json({
    success: true,
    message: "Email verified successfully",
  });
});

module.exports = {
  sendVerificationOTP,
  verifyEmailOTP,
};
