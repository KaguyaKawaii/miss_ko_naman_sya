const express = require("express");
const router = express.Router();
const User = require("../models/User");
const sendEmail = require("../mailer");

// In-memory temp user store (use Redis or DB for production)
const tempUsers = new Map();

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// 📌 Signup Step 1: Send OTP
router.post("/signup", async (req, res) => {
  try {
    const {
      name,
      email,
      id_number,
      password,
      role,
      department,
      course,
      year_level,
    } = req.body;

    if (!name || !email || !id_number || !password || !department || !role) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    if (!email.endsWith("@usa.edu.ph")) {
      return res.status(400).json({ message: "Email must end with @usa.edu.ph" });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters long." });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "Email already used." });
    }

    if (role === "Student" && (!course || !year_level)) {
      return res.status(400).json({ message: "Course and year level required for students." });
    }

    const otp = generateOtp();

    tempUsers.set(email, {
      name,
      email: email.toLowerCase(),
      id_number,
      password,
      role,
      department,
      course: course || "N/A",
      year_level: role === "Student" ? year_level : "N/A",
      otp,
      createdAt: Date.now(),
    });

    await sendEmail({
      to: email,
      subject: "Your OTP for USA-FLD Signup",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
          <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <div style="background-color: #CC0000; color: #ffffff; padding: 20px 30px;">
              <h2 style="margin: 0;">Account Verification</h2>
            </div>
            <div style="padding: 30px;">
              <h3 style="color: #333;">Hi ${name},</h3>
              <p style="font-size: 16px; color: #555;">
                Thank you for signing up with <strong>USA-FLD</strong>. To complete your registration, please use the following One-Time Password (OTP):
              </p>
              <div style="font-size: 32px; font-weight: bold; color: #CC0000; text-align: center; margin: 20px 0;">
                ${otp}
              </div>
              <p style="font-size: 16px; color: #555; margin-bottom: 20px;">
                This OTP will expire in <strong>5 minutes</strong>. If you did not initiate this request, please disregard this email.
              </p>
              <p style="font-size: 14px; color: #999;">
                — University of San Agustin Learning Resource Center
              </p>
            </div>
          </div>
        </div>
      `,
    });

    res.status(200).json({ message: "OTP sent to email." });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Server error during signup." });
  }
});

// 📌 Verify OTP and create user
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    const tempUser = tempUsers.get(email);

    if (!tempUser || tempUser.otp !== otp) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    const now = Date.now();
    if (now - tempUser.createdAt > 5 * 60 * 1000) {
      tempUsers.delete(email);
      return res.status(400).json({ message: "OTP expired. Please register again." });
    }

    const {
      name,
      id_number,
      password,
      role,
      department,
      course,
      year_level,
    } = tempUser;

    const newUser = new User({
      name,
      email: email.toLowerCase(),
      id_number,
      password,
      role,
      department,
      course,
      year_level,
    });

    await newUser.save();
    tempUsers.delete(email);

    await sendEmail({
      to: email,
      subject: "Welcome to USA-FLD Learning Resource Center!",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
          <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <div style="background-color: #CC0000; color: #ffffff; padding: 20px 30px;">
              <h2 style="margin: 0;">Welcome to USA-FLD LRC!</h2>
            </div>
            <div style="padding: 30px;">
              <h3 style="color: #333;">Hi ${name},</h3>
              <p style="font-size: 16px; color: #555;">
                We’re delighted to welcome you to the <strong>University of San Agustin Learning Resource Center</strong> community.
              </p>
              <p style="font-size: 16px; color: #555; margin: 20px 0;">
                Your account has been successfully created. You can now access our room reservation system, browse available resources, and stay informed about library services and announcements.
              </p>
              <p style="font-size: 16px; color: #555;">
                If you have any questions or need assistance, our LRC staff is here to help.
              </p>
              <p style="font-size: 14px; color: #999; margin-top: 30px;">
                — University of San Agustin Learning Resource Center Team
              </p>
            </div>
          </div>
        </div>
      `,
    });

    res.status(201).json({ message: "User registered successfully." });
  } catch (err) {
    console.error("OTP verification error:", err);
    res.status(500).json({ message: "OTP verification failed." });
  }
});

// 📌 Resend OTP
router.post("/resend-otp", async (req, res) => {
  try {
    const { email } = req.body;
    const tempUser = tempUsers.get(email);

    if (!tempUser) {
      return res.status(400).json({ message: "No signup session found. Please register again." });
    }

    const newOtp = generateOtp();
    tempUser.otp = newOtp;
    tempUser.createdAt = Date.now();

    await sendEmail({
      to: email,
      subject: "Your New OTP for USA-FLD LRC Registration",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
          <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <div style="background-color: #CC0000; color: #ffffff; padding: 20px 30px;">
              <h2 style="margin: 0;">OTP Code Resent</h2>
            </div>
            <div style="padding: 30px;">
              <p style="font-size: 16px; color: #555;">Hello ${tempUser.name},</p>
              <p style="font-size: 16px; color: #555;">
                As requested, here is your new One-Time Password (OTP) for completing your registration at the <strong>University of San Agustin Learning Resource Center</strong>:
              </p>
              <div style="font-size: 22px; font-weight: bold; color: #CC0000; text-align: center; margin: 20px 0;">
                ${newOtp}
              </div>
              <p style="font-size: 16px; color: #555;">
                This code will expire in <strong>5 minutes</strong>. Please enter it promptly to continue your registration.
              </p>
              <p style="font-size: 14px; color: #999; margin-top: 30px;">
                If you did not request this code, you may safely ignore this email.
              </p>
              <p style="font-size: 14px; color: #999;">— USA-FLD LRC Team</p>
            </div>
          </div>
        </div>
      `,
    });

    res.status(200).json({ message: "OTP resent successfully." });
  } catch (err) {
    console.error("Resend OTP error:", err);
    res.status(500).json({ message: "Failed to resend OTP." });
  }
});

module.exports = router;
