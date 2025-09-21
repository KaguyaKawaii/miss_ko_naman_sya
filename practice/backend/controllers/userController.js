const userService = require("../services/userService");
const User = require("../models/User");  // ✅ ADD THIS

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

// 📌 Update Profile (Self)
exports.updateProfile = async (req, res) => {
  try {
    const updatedUser = await userService.updateProfile(req.params.id, req.body, req.file);
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

// 📌 Get User By ID
exports.getUserById = async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found." });
    res.json({ success: true, user });
  } catch (err) {
    console.error("Get User By ID Error:", err);
    res.status(500).json({ success: false, message: err.message || "Failed to fetch user." });
  }
};

// 📌 Verify User (toggle true/false)
exports.verifyUser = async (req, res) => {
  try {
    const { verified } = req.body; // frontend sends { verified: true/false }

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
      year_level: user.year_level,  // ✅ FIXED: use correct schema field
      role: user.role
    });
  } catch (err) {
    console.error("Check participant error:", err);
    res.status(500).json({ exists: false, message: "Server error" });
  }
};
