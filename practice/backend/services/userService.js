const User = require("../models/User");
const bcrypt = require("bcryptjs");
const logAction = require("../utils/logAction");
const cloudinary = require("../config/cloudinary");
const { Readable } = require("stream");
const Notification = require("../models/Notification");
const { createNotification } = require("./notificationService");



// Cloudinary upload helper
const uploadToCloudinary = (fileBuffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = Readable.from(fileBuffer);
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => (error ? reject(error) : resolve(result))
    );
    stream.pipe(uploadStream);
  });
};

const FLOORS = ["Ground Floor", "2nd Floor", "3rd Floor", "4th Floor", "5th Floor"];

const getLeastPopulatedFloor = async () => {
  const counts = await Promise.all(
    FLOORS.map(async (floor) => ({
      floor,
      count: await User.countDocuments({ role: "Staff", floor })
    }))
  );
  counts.sort((a, b) => a.count - b.count);
  return counts[0].floor;
};

// Add User (Admin)
const addUser = async (data, file) => {
  const { name, email, id_number, password, role, department, course, yearLevel, floor, verified } = data;

  if (!name || !email || !id_number || !password || !role) throw new Error("Missing required fields.");

  const existing = await User.findOne({ 
    $or: [
      { email: email.toLowerCase() },
      { id_number: id_number }
    ]
  });
  if (existing) {
    if (existing.email === email.toLowerCase()) throw new Error("Email already used.");
    if (existing.id_number === id_number) throw new Error("ID number already used.");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  let profilePicture = null;
  if (file) {
    const upload = await uploadToCloudinary(file.buffer, "users/profile_pictures");
    profilePicture = upload.secure_url;
  }

  const newUser = new User({
    name,
    email: email.toLowerCase(),
    id_number,
    password: hashedPassword,
    department: role === "Staff" ? department || "N/A" : department || "N/A",
    course: role === "Student" ? course || "N/A" : "N/A",
    year_level: role === "Student" ? yearLevel || "N/A" : "N/A",
    floor: role === "Staff" ? floor || "N/A" : "N/A",
    role,
    
    profilePicture,
  });

  await newUser.save();
  await logAction(newUser._id, newUser.id_number, newUser.name, "User Created", "Added via Admin Panel");
  return newUser.toObject();
};

// Signup
const signup = async (data, file) => {
  const { name, email, id_number, password, role, department, course, yearLevel } = data;

  if (!name || !email || !id_number || !password || !role) throw new Error("Missing required fields.");
  if (!email.endsWith("@usa.edu.ph")) throw new Error("Email must end with @usa.edu.ph");
  if (password.length < 8) throw new Error("Password must be at least 8 characters.");

  const existing = await User.findOne({ 
    $or: [
      { email: email.toLowerCase() },
      { id_number: id_number }
    ]
  });
  if (existing) {
    if (existing.email === email.toLowerCase()) throw new Error("Email already used.");
    if (existing.id_number === id_number) throw new Error("ID number already used.");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  let profilePicture = null;
  if (file) {
    const upload = await uploadToCloudinary(file.buffer, "users/profile_pictures");
    profilePicture = upload.secure_url;
  }

  const newUser = new User({
    name,
    email: email.toLowerCase(),
    id_number,
    password: hashedPassword,
    department,
    course: role === "Student" ? course : "N/A",
    year_level: role === "Student" ? yearLevel : "N/A",
    role,
    profilePicture,
  });

  await newUser.save();
  await logAction(newUser._id, newUser.id_number, newUser.name, "User Signup", "Registered account");

  return newUser.toObject();
};

// Login
const login = async ({ email, password }) => {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) throw new Error("Invalid credentials.");

  const validPass = await bcrypt.compare(password, user.password);
  if (!validPass) throw new Error("Invalid credentials.");

    if (user.suspended) {
    throw new Error("This account is suspended. Please contact the administrator.");
  }

  await logAction(user._id, user.id_number, user.name, "User Login", "Logged in");

  const { _id, name, id_number, department, course, year_level, floor, role, verified, profilePicture } = user;
  return { _id, name, email: user.email, id_number, department, course, year_level, floor, role, verified, profilePicture };
};

// Update Profile
const updateProfile = async (id, data, file) => {
  const user = await User.findById(id);
  if (!user) throw new Error("User not found.");

  const allowedFields = ["name", "course", "department", "year_level", "floor"];
  allowedFields.forEach(field => {
    if (data[field] !== undefined && data[field] !== null && data[field] !== "") {
      user[field] = data[field];
    }
  });

  if (file) {
    const upload = await uploadToCloudinary(file.buffer, "users/profile_pictures");
    user.profilePicture = upload.secure_url;
  }

  await user.save();
  await logAction(user._id, user.id_number, user.name, "Profile Updated", "User updated profile info");
  return user.toObject();
};

// Admin Edit User
const adminEditUser = async (id, data, file) => {
  const user = await User.findById(id);
  if (!user) throw new Error("User not found.");

  // ✅ Normalize field naming from frontend
  if (data.yearLevel && !data.year_level) {
    data.year_level = data.yearLevel;
  }

  if (data.email && data.email !== user.email) {
    const emailExists = await User.findOne({ email: data.email.toLowerCase(), _id: { $ne: id } });
    if (emailExists) throw new Error("Email already used by another user.");
  }

  if (data.id_number && data.id_number !== user.id_number) {
    const idExists = await User.findOne({ id_number: data.id_number, _id: { $ne: id } });
    if (idExists) throw new Error("ID number already used by another user.");
  }

  const editableFields = ["name", "email", "id_number", "department", "course", "year_level", "floor", "role"];
  editableFields.forEach(field => {
    if (data[field] !== undefined && data[field] !== null && data[field] !== "") {
      user[field] = data[field];
    }
  });

  if (typeof data.verified !== "undefined") {
    user.verified = data.verified === "true" || data.verified === true;
  }

  // ✅ Fix password handling → no double-hash
  if (data.password && data.password.trim() !== "") {
    if (data.password.length < 8) {
      throw new Error("Password must be at least 8 characters.");
    }
    user.password = data.password; // let pre-save hook hash it
  }

  if (file) {
    const upload = await uploadToCloudinary(file.buffer, "users/profile_pictures");
    user.profilePicture = upload.secure_url;
  }

  await user.save();
  await logAction(user._id, user.id_number, user.name, "Admin Edited User", "User info updated by admin");
  return user.toObject();
};



// Change Password
const changePassword = async (id, oldPassword, newPassword) => {
  const user = await User.findById(id);
  if (!user) throw new Error("User not found.");

  const validOld = await bcrypt.compare(oldPassword, user.password);
  if (!validOld) throw new Error("Old password is incorrect.");

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);
  await user.save();
  await logAction(user._id, user.id_number, user.name, "Password Changed", "User changed password");

  return true;
};

// ✅ Get all non-archived users
const getAllUsers = async () => User.find({ archived: { $ne: true } }).select("-password").sort({ created_at: -1 });

// ✅ Get archived users with archivedAt timestamp
const getArchivedUsers = async () => User.find({ archived: true })
  .select("-password")
  .sort({ archivedAt: -1 });

// ✅ Get user by ID
const getUserById = async (id) => User.findById(id).select("-password");


// ✅ Verify or Unverify user
const verifyUser = async (id, verified, io) => {
  const user = await User.findByIdAndUpdate(
    id,
    { verified },
    { new: true }
  );

  if (user) {
    // Log the action
    await logAction(
      user._id,
      user.id_number,
      user.name,
      verified ? "User Verified" : "User Unverified",
      verified ? "User account marked as verified" : "User account marked as unverified"
    );

    // ✅ Create a notification for the user only
    await createNotification(
      {
        userId: user._id,
        message: verified
          ? "Your account is now verified."
          : "Your account is not verified. Please contact support if you believe this is an error.",
        type: "system",
        status: "New",
      },
      io
    );
  }

  return user;
};

// Suspend user (set suspended: true)
const suspendUser = async (id, io) => {
  const user = await User.findByIdAndUpdate(
    id,
    { suspended: true },
    { new: true }
  );

  if (user) {
    await logAction(user._id, user.id_number, user.name, "User Suspended", "User account suspended");
    await createNotification(
      {
        userId: user._id,
        message: "Your account has been suspended. Contact support for more information.",
        type: "system",
        status: "New",
      },
      io
    );
  }

  return user;
};

// Unsuspend user (set suspended: false)
const unsuspendUser = async (id, io) => {
  const user = await User.findByIdAndUpdate(
    id,
    { suspended: false },
    { new: true }
  );

  if (user) {
    await logAction(user._id, user.id_number, user.name, "User Unsuspended", "User account unsuspended");
    await createNotification(
      {
        userId: user._id,
        message: "Your account has been restored. You may now log in.",
        type: "system",
        status: "New",
      },
      io
    );
  }

  return user;
};

// Toggle suspend state (accepts boolean suspend)
const toggleSuspend = async (id, suspend, io) => {
  const user = await User.findByIdAndUpdate(
    id,
    { suspended: !!suspend },
    { new: true }
  );

  if (user) {
    await logAction(
      user._id,
      user.id_number,
      user.name,
      suspend ? "User Suspended" : "User Unsuspended",
      suspend ? "User account suspended via admin toggle" : "User account unsuspended via admin toggle"
    );

    await createNotification(
      {
        userId: user._id,
        message: suspend
          ? "Your account has been suspended. Contact support for more information."
          : "Your account has been restored. You may now log in.",
        type: "system",
        status: "New",
      },
      io
    );
  }

  return user;
};

// ✅ Archive user with timestamp
const archiveUser = async (id) => {
  const user = await User.findByIdAndUpdate(
    id,
    { archived: true, archivedAt: new Date() },
    { new: true }
  );
  if (user) await logAction(user._id, user.id_number, user.name, "User Archived", "User account archived");
  return user;
};

// ✅ Restore user
const restoreUser = async (id) => {
  const user = await User.findByIdAndUpdate(
    id,
    { archived: false, archivedAt: null },
    { new: true }
  );
  if (user) await logAction(user._id, user.id_number, user.name, "User Restored", "User account restored from archive");
  return user;
};

// ✅ Delete archived user
const deleteArchivedUser = async (id) => {
  const user = await User.findByIdAndDelete(id);
  if (user) await logAction(user._id, user.id_number, user.name, "User Deleted", "Archived user permanently deleted");
  return user;
};

// Add this to userService.js
exports.updateProfile = async (userId, updateData, file) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    // Handle file upload if provided
    if (file) {
      updateData.profilePicture = `/uploads/profiles/${file.filename}`;
    }

    // Update user data
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        user[key] = updateData[key];
      }
    });

    await user.save();
    return user;
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  addUser,
  signup,
  login,
  updateProfile,
  adminEditUser,
  changePassword,
  getAllUsers,
  getUserById,
  verifyUser,
  archiveUser,
  restoreUser,
  deleteArchivedUser,
  getArchivedUsers,
  updateProfile,
   // newly exported suspend functions:
  suspendUser,
  unsuspendUser,
  toggleSuspend,
  // note: updateProfile is already exported above — keep it once
};
