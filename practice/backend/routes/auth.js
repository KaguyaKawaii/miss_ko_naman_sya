// === /routes/auth.js ===
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const sendEmail = require("../mailer");

// In-memory temp user store (use Redis for production)
const tempUsers = new Map();

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Signup Step 1: Send OTP
router.post("/signup", async (req, res) => {
  try {
    const { name, email, id_number, password, department, course, year_level } = req.body;

    if (!name || !email || !id_number || !password || !department)
      return res.status(400).json({ message: "Missing required fields." });

    if (!email.endsWith("@usa.edu.ph"))
      return res.status(400).json({ message: "Email must end with @usa.edu.ph" });

    if (password.length < 8)
      return res.status(400).json({ message: "Password must be at least 8 characters long" });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Email already used." });

    const isStudent = course !== "N/A" && year_level !== "N/A";
    if (isStudent && (!course || !year_level))
      return res.status(400).json({ message: "Course and year level required for students." });

    const otp = generateOtp();

    // Store user in memory with OTP
    tempUsers.set(email, {
      name,
      email,
      id_number,
      password,
      department,
      course,
      year_level,
      otp,
      createdAt: Date.now(),
    });

    await sendEmail(
      email,
      "Your OTP for USA-FLD Signup",
      `<p>Hi ${name},</p><p>Your One-Time Password (OTP) is <b>${otp}</b>. It will expire in 5 minutes.</p>`
    );

    res.status(200).json({ message: "OTP sent to email." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error during signup." });
  }
});

// Verify OTP and create user
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    const tempUser = tempUsers.get(email);

    if (!tempUser || tempUser.otp !== otp)
      return res.status(400).json({ message: "Invalid or expired OTP." });

    const now = Date.now();
    if (now - tempUser.createdAt > 5 * 60 * 1000) {
      tempUsers.delete(email);
      return res.status(400).json({ message: "OTP expired. Please register again." });
    }

    const { name, id_number, password, department, course, year_level } = tempUser;

    const newUser = new User({
      name,
      email,
      id_number,
      password,
      department,
      course,
      year_level,
    });

    await newUser.save();
    tempUsers.delete(email);

    await sendEmail(
      email,
      "Welcome to USA-FLD!",
      `<h3>Hi ${name},</h3><p>Your account was successfully created.</p>`
    );

    res.status(201).json({ message: "User registered successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "OTP verification failed." });
  }
});

// Resend OTP
router.post("/resend-otp", async (req, res) => {
  try {
    const { email } = req.body;
    const tempUser = tempUsers.get(email);

    if (!tempUser)
      return res.status(400).json({ message: "No signup session found. Please register again." });

    const newOtp = generateOtp();
    tempUser.otp = newOtp;
    tempUser.createdAt = Date.now();

    await sendEmail(
      email,
      "Resend OTP for USA-FLD Signup",
      `<p>Your new OTP is <b>${newOtp}</b>. It will expire in 5 minutes.</p>`
    );

    res.status(200).json({ message: "OTP resent successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to resend OTP." });
  }
});

module.exports = router;
