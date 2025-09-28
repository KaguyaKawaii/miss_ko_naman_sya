const mongoose = require("mongoose");
const userService = require("../services/userService");
const User = require("../models/User");  // ✅ ADD THIS

// 📌 Fetch users by role (used in AdminReports for staff assignment)
exports.getUsersByRole = async (req, res) => {
  try {
    const query = {};
    if (req.query.role) {
      query.role = req.query.role;
    }
    const users = await User.find(query).select("-password");
    res.json({ success: true, users });
  } catch (err) {
    console.error("Get Users By Role Error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
};

// 📌 Add User (Admin)
exports.addUser = async (req, res) => {
  try {
    const newUser = await userService.addUser(req.body, req.file);
    res.status(201).json({ success: true, message: "User added successfully.", user: newUser });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message || "Failed to add user." });
  }
};

// 📌 Signup
exports.signup = async (req, res) => {
  try {
    const newUser = await userService.signup(req.body, req.file);
    res.status(201).json({ success: true, message: "User registered successfully.", user: newUser });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message || "Failed to signup." });
  }
};

// 📌 Login
exports.login = async (req, res) => {
  try {
    const userData = await userService.login(req.body);
    res.json({ success: true, message: "Login successful.", user: userData });
  } catch (err) {
    res.status(401).json({ success: false, message: err.message || "Invalid credentials." });
  }
};

// 📌 Update Profile (Self) - FIXED ENDPOINT
exports.updateProfile = async (req, res) => {
  try {
    const updatedUser = await userService.updateProfile(req.params.id, req.body);
    res.json({ success: true, message: "Profile updated successfully.", user: updatedUser });
  } catch (err) {
    console.error("Update Profile Error:", err);
    res.status(400).json({ success: false, message: err.message || "Failed to update profile." });
  }
};

// 📌 Upload Profile Picture
exports.uploadPicture = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded." });
    const updatedUser = await userService.updateProfile(req.params.id, {}, req.file);
    res.json({ success: true, message: "Profile picture updated.", user: updatedUser });
  } catch (err) {
    console.error("Upload Picture Error:", err);
    res.status(400).json({ success: false, message: err.message || "Failed to upload picture." });
  }
};

// 📌 Remove Profile Picture
exports.removePicture = async (req, res) => {
  try {
    const updatedUser = await userService.updateProfile(req.params.id, { profilePicture: null });
    res.json({ success: true, message: "Profile picture removed.", user: updatedUser });
  } catch (err) {
    console.error("Remove Picture Error:", err);
    res.status(400).json({ success: false, message: err.message || "Failed to remove picture." });
  }
};

// 📌 Change Password
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Old and new passwords are required." });
    }
    await userService.changePassword(req.params.id, oldPassword, newPassword);
    res.json({ success: true, message: "Password changed successfully." });
  } catch (err) {
    console.error("Change Password Error:", err);
    res.status(400).json({ success: false, message: err.message || "Failed to change password." });
  }
};

// 📌 Admin Edit User
exports.adminEditUser = async (req, res) => {
  try {
    const updatedUser = await userService.adminEditUser(req.params.id, req.body, req.file);
    res.json({ success: true, message: "User updated successfully.", user: updatedUser });
  } catch (err) {
    console.error("Admin Edit User Error:", err);
    res.status(400).json({ success: false, message: err.message || "Failed to edit user." });
  }
};

// 📌 Archive User
exports.archiveUser = async (req, res) => {
  try {
    const archivedUser = await userService.archiveUser(req.params.id);
    if (!archivedUser) return res.status(404).json({ success: false, message: "User not found." });
    res.json({ success: true, message: "User archived.", user: archivedUser });
  } catch (err) {
    console.error("Archive User Error:", err);
    res.status(400).json({ success: false, message: err.message || "Failed to archive user." });
  }
};

// 📌 Restore User
exports.restoreUser = async (req, res) => {
  try {
    const restoredUser = await userService.restoreUser(req.params.id);
    if (!restoredUser) return res.status(404).json({ success: false, message: "User not found." });
    res.json({ success: true, message: "User restored.", user: restoredUser });
  } catch (err) {
    console.error("Restore User Error:", err);
    res.status(400).json({ success: false, message: err.message || "Failed to restore user." });
  }
};

// 📌 Get Archived Users
exports.getArchivedUsers = async (req, res) => {
  try {
    const archivedUsers = await userService.getArchivedUsers();
    res.json({ success: true, users: archivedUsers });
  } catch (err) {
    console.error("Get Archived Users Error:", err);
    res.status(500).json({ success: false, message: err.message || "Failed to fetch archived users." });
  }
};

// 📌 Delete Archived User
exports.deleteArchivedUser = async (req, res) => {
  try {
    const deletedUser = await userService.deleteArchivedUser(req.params.id);
    if (!deletedUser) return res.status(404).json({ success: false, message: "User not found." });
    res.json({ success: true, message: "Archived user deleted permanently." });
  } catch (err) {
    console.error("Delete Archived User Error:", err);
    res.status(400).json({ success: false, message: err.message || "Failed to delete archived user." });
  }
};

// 📌 Get All Users (non-archived)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.json({ success: true, users });
  } catch (err) {
    console.error("Get All Users Error:", err);
    res.status(500).json({ success: false, message: err.message || "Failed to fetch users." });
  }
};

exports.toggleSuspendUser = async (req, res) => {
  try {
    const suspend = req.body.suspend === true || req.body.suspend === "true";
    const io = req.io || null;
    const user = await userService.toggleSuspend(req.params.id, suspend, io);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: `User ${user.suspended ? "suspended" : "unsuspended"} successfully`, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Suspend User
exports.suspendUser = async (req, res) => {
  try {
    const user = await userService.suspendUser(req.params.id, req.io);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User suspended successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Error suspending user", error });
  }
};

// Unsuspend User
exports.unsuspendUser = async (req, res) => {
  try {
    const user = await userService.unsuspendUser(req.params.id, req.io);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User unsuspended successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Error unsuspending user", error });
  }
};

// 📌 Get User By ID
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid user ID format" });
    }
    const user = await User.findById(id).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({ success: true, user });
  } catch (err) {
    console.error("Error fetching user by ID:", err);
    res.status(500).json({ success: false, message: "Failed to fetch user" });
  }
};

// 📌 Search Users
exports.searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ success: false, message: "Search query required" });
    }
    const users = await User.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { department: { $regex: q, $options: 'i' } },
        { id_number: { $regex: q, $options: 'i' } }
      ],
      archived: { $ne: true }
    }).select('name email department role id_number');
    res.json({ success: true, users });
  } catch (err) {
    console.error("Search users error:", err);
    res.status(500).json({ success: false, message: "Search failed" });
  }
};

// 📌 Verify User
exports.verifyUser = async (req, res) => {
  try {
    const { verified } = req.body;
    if (verified === undefined) {
      return res.status(400).json({ success: false, message: "Verified status is required." });
    }
    const updatedUser = await userService.verifyUser(req.params.id, verified);
    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found." });
    }
    res.json({
      success: true,
      message: `User ${verified ? "verified" : "unverified"}.`,
      user: updatedUser
    });
  } catch (err) {
    console.error("Verify User Error:", err);
    res.status(400).json({ success: false, message: err.message || "Failed to update verification status." });
  }
};

// 📌 Get Unread Counts
exports.getUnreadCounts = async (req, res) => {
  try {
    res.json({ success: true, counts: { notifications: 0, messages: 0 } });
  } catch (err) {
    console.error("Get Unread Counts Error:", err);
    res.status(500).json({ success: false, message: err.message || "Failed to fetch unread counts." });
  }
};

// 📌 Check if participant exists and is verified
exports.checkParticipant = async (req, res) => {
  try {
    const { idNumber } = req.query;
    if (!idNumber) return res.status(400).json({ exists: false, message: "Missing ID number" });
    const user = await User.findOne({ id_number: idNumber });
    if (!user) return res.json({ exists: false });
    res.json({
      exists: true,
      verified: user.verified,
      name: user.name,
      department: user.department,
      course: user.course,
      year_level: user.year_level,
      role: user.role
    });
  } catch (err) {
    console.error("Check participant error:", err);
    res.status(500).json({ exists: false, message: "Server error" });
  }
};
