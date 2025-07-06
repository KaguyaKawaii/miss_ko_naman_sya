const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Notification = require("../models/Notification");
const sendEmail = require("../mailer");
const bcrypt = require("bcryptjs");
const path = require("path"); // ✅ Make sure this is included
const multer = require("multer");

const fs = require("fs");

router.post("/", async (req, res) => {
  try {
    const {
      name,
      email,
      id_number,
      password,
      department,
      course,
      yearLevel,
      role,
      floor,
      verified
    } = req.body;

    if (!name || !email || !id_number || !password || !role) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: "Email already used." });

    const newUser = new User({
      name,
      email: email.toLowerCase(),
      id_number,
      password,
      department: role === "Staff" ? "N/A" : department || "N/A",
      course: role === "Student" ? course || "N/A" : "N/A",
      year_level: role === "Student" ? yearLevel || "N/A" : "N/A",
      floor: role === "Staff" ? floor || "N/A" : "N/A", // ✅ THIS IS WHAT WAS MISSING
      role,
      verified: !!verified,
    });

    await newUser.save();
    res.status(201).json({ message: "User added successfully." });
  } catch (err) {
    console.error("Add user error:", err);
    res.status(500).json({ message: "Failed to add user." });
  }
});


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "..", "uploads", "profile-pictures");
    fs.mkdirSync(uploadPath, { recursive: true }); // ✅ auto-create directory
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${req.params.id}${ext}`);
  },
});



const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png"];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Only JPEG or PNG images allowed."));
  },
});

// 📌 UPLOAD PROFILE PICTURE
router.post("/upload-picture/:id", upload.single("profile"), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found." });

    const ext = path.extname(req.file.originalname);
    const filename = `${req.params.id}${ext}`;

    user.profilePicture = `/uploads/profile-pictures/${filename}`;
    await user.save();

    
    // ✅ Emit socket event so frontend can auto-refresh
    req.app.get("io").emit("user-updated", user._id.toString());

    res.json({
      message: "Profile picture updated successfully.",
      profilePicture: user.profilePicture,
    });
  } catch (err) {
    console.error("Upload picture error:", err);
    res.status(500).json({ message: "Failed to upload profile picture." });
  }
});


// Reset profile picture to default
router.delete("/remove-picture/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ message: "User not found." });

    if (user.profilePicture) {
      const filePath = path.join(__dirname, "..", "uploads", user.profilePicture.split("/uploads/")[1]);
      // Delete the file if it exists
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Set the profilePicture to null (or a default string if needed)
    user.profilePicture = null;
    await user.save();

    res.json({ message: "Profile picture reset to default." });
  } catch (err) {
    console.error("Error resetting profile picture:", err);
    res.status(500).json({ message: "Server error while resetting profile picture." });
  }
});



// 📌 USER SIGNUP
router.post("/signup", async (req, res) => {
  try {
    const { name, email, id_number, password, department, course, yearLevel, role } = req.body;

    if (!name || !email || !id_number || !password || !department || !role) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    if (!email.endsWith("@usa.edu.ph")) {
      return res.status(400).json({ message: "Email must end with @usa.edu.ph" });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters long." });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: "Email already used." });

    if (role === "Student" && (!course || !yearLevel)) {
      return res.status(400).json({ message: "Course and year level required for students." });
    }

    const newUser = new User({
      name,
      email: email.toLowerCase(),
      id_number,
      password,
      department,
      course: role === "Student" ? course : "N/A",
      year_level: role === "Student" ? yearLevel : "N/A",
      role,
    });

    await newUser.save();

    await sendEmail(
      email,
      "Welcome to USA-FLD!",
      `<h2>Hi ${name},</h2><p>Your account was created successfully as a ${role}${role === "Student" ? ` (${yearLevel} - ${course})` : ""} in the ${department} department!</p>`
    );

    res.status(201).json({ message: "User registered successfully and welcome email sent." });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Server error during signup." });
  }
});

// 📌 USER LOGIN
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
        name: user.name,
        email: user.email,
        id_number: user.id_number,
        department: user.department,
        course: user.course,
        year_level: user.year_level,
        role: user.role,
        verified: user.verified,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error during login." });
  }
});

// 📌 GET ALL USERS
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

// 📌 GET USER BY ID
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

// 📌 UPDATE PROFILE (Edit limited fields from user)
router.put("/update-profile", async (req, res) => {
  try {
    const { userId, name, course, department, year_level } = req.body;
    if (!userId) return res.status(400).json({ message: "Missing userId" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    if (name) user.name = name;
    if (course) user.course = course;
    if (department) user.department = department;
    if (year_level) user.year_level = year_level;

    await user.save();

    const io = req.app.get("io");
    io.emit("user-updated", user._id.toString());

    res.json({
      message: "Profile updated successfully.",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        department: user.department,
        course: user.course,
        year_level: user.year_level,
        role: user.role,
        verified: user.verified,
      },
    });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ message: "Failed to update profile." });
  }
});

// 📌 CHANGE PASSWORD (with old password validation)
router.put("/change-password/:id", async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found." });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Incorrect current password." });

    if (!newPassword || newPassword.length < 8)
      return res.status(400).json({ message: "New password must be at least 8 characters." });

    user.password = newPassword; // ✨ plain password, will be hashed by model
    await user.save();

    res.json({ message: "Password changed successfully." });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ message: "Failed to change password." });
  }
});


// 📌 VERIFY USER
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
        status: "Info",
      });

      io.to(user._id.toString()).emit("notification", {
        message: "Your account has been verified!",
      });
    }

    res.json(user);
  } catch (err) {
    console.error("Patch user error:", err);
    res.status(500).json({ message: "Failed to update verification status." });
  }
});

// 📌 DELETE USER
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

// 📌 FULL ADMIN EDIT (admin/internal)
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
      verified,
    } = req.body;

    user.name = name;
    user.email = email.toLowerCase();
    user.id_number = id_number;
    user.department = department || "N/A";
    user.course = course || "N/A";
    user.year_level = yearLevel || "N/A";
    user.role = role;
    user.verified = verified;
    user.floor = floor || "N/A";

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

module.exports = router;