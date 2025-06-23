const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Notification = require("../models/Notification");
const sendEmail = require("../mailer");
const bcrypt = require("bcryptjs");

// ─────────────────────────────────────────────
// 📌 USER SIGNUP
// ─────────────────────────────────────────────
router.post("/signup", async (req, res) => {
  try {
    const { name, email, id_number, password, department, course, yearLevel, role } = req.body;

    if (!name || !email || !id_number || !password || !department || !course || !yearLevel || !role) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (!email.endsWith("@usa.edu.ph")) {
      return res.status(400).json({ message: "Email must end with @usa.edu.ph" });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters long." });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: "Email already used." });

    const newUser = new User({
      name,
      email,
      id_number,
      password,
      department,
      course,
      yearLevel,
      role
    });

    await newUser.save();

    await sendEmail(
      email,
      "Welcome to USA-FLD!",
      `<h3>Hi ${name},</h3><p>Your account was created successfully as a ${yearLevel} student of ${course} in the ${department} department!</p>`
    );

    res.status(201).json({ message: "User registered successfully and welcome email sent." });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Server error during signup." });
  }
});

// ─────────────────────────────────────────────
// 📌 USER LOGIN
// ─────────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ message: "Invalid credentials." });

    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) return res.status(401).json({ message: "Invalid credentials." });

    res.json({
      message: "Login successful.",
      user: {
        _id: user._id,
        id: user.id,
        name: user.name,
        email: user.email,
        id_number: user.id_number,
        department: user.department,
        course: user.course,
        yearLevel: user.yearLevel,
        role: user.role,
        verified: user.verified
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error during login." });
  }
});

// ─────────────────────────────────────────────
// 📌 FETCH ALL USERS (optional filtering)
// ─────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const { role, q } = req.query;
    const filter = {};
    if (role && ["Student", "Faculty", "Staff"].includes(role)) filter.role = role;
    if (q && q.trim()) {
      const regex = new RegExp(q.trim(), "i");
      filter.$or = [{ name: regex }, { email: regex }, { id_number: regex }];
    }
    const users = await User.find(filter).select("-password").sort({ created_at: -1 });
    res.json(users);
  } catch (err) {
    console.error("Fetch users error:", err);
    res.status(500).json({ message: "Failed to fetch users." });
  }
});

// ─────────────────────────────────────────────
// 📌 UPDATE USER VERIFIED STATUS + Emit Notification
// ─────────────────────────────────────────────
router.patch("/:id", async (req, res) => {
  try {
    if (!Object.prototype.hasOwnProperty.call(req.body, "verified"))
      return res.status(400).json({ message: "Only 'verified' can be patched." });

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found." });

    user.verified = req.body.verified;
    await user.save();

    const io = req.app.get("io");
    io.emit("user-updated", req.params.id);

    if (req.body.verified) {
      await Notification.create({
        userId: user._id,
        message: "Your account has been verified!",
        status: "Info"
      });

      io.to(user._id.toString()).emit("notification", {
        message: "Your account has been verified!"
      });
    }

    res.json(user);
  } catch (err) {
    console.error("Patch user error:", err);
    res.status(500).json({ message: "Failed to update verification status." });
  }
});

// ─────────────────────────────────────────────
// 📌 UPDATE USER (General edit) ← NEW
// ─────────────────────────────────────────────
router.put("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found." });

    const {
      name,
      email,
      id_number,
      department,
      course,
      yearLevel,
      role,
      floor,
      password,
      verified
    } = req.body;

    user.name        = name;
    user.email       = email.toLowerCase();
    user.id_number   = id_number;
    user.department  = department || "N/A";
    user.course      = course || "N/A";
    user.year_level  = yearLevel || "N/A";
    user.role        = role;
    user.verified    = verified;
    user.floor       = floor || "N/A";

    if (password && password.length >= 8) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();
    res.json({ message: "User updated successfully." });
  } catch (err) {
    console.error("Edit user error:", err);
    res.status(500).json({ message: "Failed to update user." });
  }
});

// ─────────────────────────────────────────────
// 📌 DELETE USER
// ─────────────────────────────────────────────
router.delete("/:id", async (req, res) => {
  try {
    const result = await User.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ message: "User not found." });
    res.json({ message: "User deleted successfully." });
  } catch (err) {
    console.error("Delete user error:", err);
    res.status(500).json({ message: "Failed to delete user." });
  }
});

// ─────────────────────────────────────────────
// 📌 GET USER BY ID
// ─────────────────────────────────────────────
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found." });
    res.json(user);
  } catch (err) {
    console.error("Fetch user by ID error:", err);
    res.status(500).json({ message: "Failed to fetch user." });
  }
});

module.exports = router;
