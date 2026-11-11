const sendEmail = require("./sendEmail");

const sendVerificationEmail = async (email, otp, name = "User") => {
  const subject = "Verify Your Email - DriveIQ";

  const text = `
Hello ${name},

Thank you for registering with DriveIQ.

Your email verification OTP is: ${otp}

This OTP is valid for 5 minutes.

If you did not create this account, please ignore this email.

DriveIQ Team
  `;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
      <h2 style="color: #2563eb;">Welcome to DriveIQ!</h2>

      <p>Hello ${name},</p>

      <p>Thank you for registering with DriveIQ.</p>

      <p>Your email verification OTP is:</p>

      <h1 style="letter-spacing: 8px; color: #2563eb;">
        ${otp}
      </h1>

      <p>This OTP is valid for <strong>5 minutes</strong>.</p>

      <p>If you did not create this account, please ignore this email.</p>

      <hr />

      <p style="color: #777;">DriveIQ Team</p>
    </div>
  `;

  return await sendEmail({
    to: email,
    subject,
    text,
    html,
  });
};

module.exports = sendVerificationEmail;
