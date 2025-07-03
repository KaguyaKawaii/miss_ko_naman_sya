const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");

// PH time helper
function nowPH() {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc + 480 * 60000);
}

// Nodemailer transporter — replace with your actual email/app password
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER, // use env vars
    pass: process.env.EMAIL_PASS,
  },
});

// POST /api/forgot-password — Request OTP
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "Email not registered." });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;
    user.otpExpiry = new Date(nowPH().getTime() + 10 * 60 * 1000);
    await user.save();

    await transporter.sendMail({
  from: '"USA-FLD" <no-reply@usa.edu.ph>',  // ✅ good practice sender name
  to: user.email,
  subject: "Password Reset OTP — USA-FLD",
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
      <h2 style="color: #CC0000; text-align: center;">USA-FLD Password Reset</h2>
      <p style="font-size: 16px;">Hello <b>${user.name}</b>,</p>
      <p style="font-size: 16px;">You recently requested to reset your password. Use the OTP code below to proceed:</p>
      <div style="text-align: center; margin: 30px 0;">
        <span style="display: inline-block; font-size: 32px; font-weight: bold; color: #CC0000; letter-spacing: 4px;">${otp}</span>
      </div>
      <p style="font-size: 14px; color: #555;">This OTP is valid for <b>10 minutes</b>. If you didn’t request this, please ignore this email.</p>
      <p style="margin-top: 20px; font-size: 14px;">Thank you,<br><b>USA-FLD Learning Resource Center</b></p>
    </div>
  `,
});


    res.json({ message: "OTP sent to your email." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to send OTP." });
  }
});

// POST /api/verify-otp — Verify OTP and reset password
router.post("/verify-otp", async (req, res) => {
  const { email, otp, newPassword, confirmPassword } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found." });

    if (user.otp !== otp)
      return res.status(400).json({ message: "Invalid OTP." });

    if (user.otpExpiry < nowPH())
      return res.status(400).json({ message: "OTP expired." });

    if (newPassword !== confirmPassword)
      return res.status(400).json({ message: "Passwords do not match." });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.skipPasswordHash = true; // ✅ skip pre-save hashing
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.json({ message: "Password reset successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to reset password." });
  }
});

module.exports = router;
