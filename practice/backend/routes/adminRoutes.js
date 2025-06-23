const express = require("express");
const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");
const Reservation = require("../models/Reservation");  // ✅ add this
const User = require("../models/User");                // ✅ and this

const router = express.Router();

// Create admin account (register)
router.post("/register", async (req, res) => {
  try {
    const { username, password, name, email } = req.body;

    if (!username || !password || !name || !email) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const existingAdmin = await Admin.findOne({ username: username.toLowerCase() });
    if (existingAdmin) {
      return res.status(409).json({ message: "Username already exists." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newAdmin = new Admin({
      username: username.toLowerCase(),
      password: hashedPassword,
      name,
      email,
    });

    await newAdmin.save();

    res.status(201).json({ message: "Admin account created successfully." });
  } catch (err) {
    console.error("Admin registration error:", err);
    res.status(500).json({ message: "Failed to create admin account." });
  }
});

// Admin login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const admin = await Admin.findOne({ username: username.toLowerCase() });
    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    res.status(200).json({
      message: "Login successful",
      admin: {
        _id: admin._id,
        username: admin.username,
        name: admin.name,
        email: admin.email,
      },
    });
  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET system summary counts for dashboard
router.get("/summary", async (req, res) => {
  try {
    const reservations = await Reservation.countDocuments();
    const users = await User.countDocuments();

    res.status(200).json({
      reservations,
      users,
    });
  } catch (err) {
    console.error("Summary fetch error:", err);
    res.status(500).json({ message: "Failed to fetch summary counts." });
  }
});

module.exports = router;
