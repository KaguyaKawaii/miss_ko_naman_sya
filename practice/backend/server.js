require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const sendEmail = require("./mailer");

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

// Helpers
function nowPH() {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc + 480 * 60000); // UTC+8
}

// MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Counter
const counterSchema = new mongoose.Schema({
  _id: String,
  seq: { type: Number, default: 0 },
});
const Counter = mongoose.model("Counter", counterSchema);

// User schema
const userSchema = new mongoose.Schema({
  id: Number,
  username: { type: String, unique: true, sparse: true, lowercase: true },
  name: String,
  email: { type: String, lowercase: true, unique: true },
  id_number: String,
  password: String,
  department: String,
  course: String,
  yearLevel: String,
  role: { type: String, enum: ["Student", "Faculty", "Staff"], default: "Student" },
  verified: { type: Boolean, default: false },
  created_at: { type: Date, default: nowPH },
});

// Auto‑increment ID, hash password, auto‑verify non‑students
userSchema.pre("save", async function (next) {
  if (this.isNew) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        "userId",
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      this.id = counter.seq;

      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);

      this.verified = ["Faculty", "Staff"].includes(this.role);
      next();
    } catch (err) {
      next(err);
    }
  } else {
    next();
  }
});
const User = mongoose.model("User", userSchema);

// Admin schema
const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  name: String,
  email: String,
  created_at: { type: Date, default: nowPH },
});

// Hash admin password
adminSchema.pre("save", async function (next) {
  if (this.isNew) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});
const Admin = mongoose.model("Admin", adminSchema);

// Seed default admin
(async () => {
  try {
    if (await Admin.countDocuments() === 0) {
      await new Admin({
        username: "usa_fld_admin",
        password: "admin@2025",
        name: "System Admin",
        email: "admin@usa.edu.ph",
      }).save();
      console.log("✅ Default admin created: usa_fld_admin / admin@2025");
    }
  } catch (err) {
    console.error("❌ Failed to seed default admin:", err);
  }
})();

// OTP signup
const pendingVerifications = {};
const OTP_EXPIRATION = 10 * 60 * 1000;

app.post("/signup", async (req, res) => {
  const { name, email, id_number, password, department, course, yearLevel, role } = req.body;
  if (!name || !email || !id_number || !password || !department || !course || !yearLevel || !role)
    return res.status(400).json({ message: "All fields are required." });

  if (!["Student", "Faculty", "Staff"].includes(role))
    return res.status(400).json({ message: "Invalid role." });

  if (!email.toLowerCase().endsWith("@usa.edu.ph"))
    return res.status(400).json({ message: "Email must be @usa.edu.ph." });

  if (password.length < 8)
    return res.status(400).json({ message: "Password must be at least 8 characters." });

  try {
    if (await User.findOne({ email: email.toLowerCase() }))
      return res.status(409).json({ message: "Email is already registered." });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    pendingVerifications[email] = {
      name,
      email: email.toLowerCase(),
      id_number,
      password,
      department,
      course,
      yearLevel,
      role,
      otp,
      createdAt: Date.now(),
    };

    await sendEmail(
      email,
      "Your OTP for USA.edu.ph Verification",
      `Hello ${name},<br><br>Your OTP: <strong>${otp}</strong><br>Valid for 10 minutes.`
    );

    res.json({ message: "OTP sent to your email." });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Signup failed. Try again." });
  }
});

app.post("/resend-otp", async (req, res) => {
  const { email } = req.body;
  const record = pendingVerifications[email];
  if (!record) return res.status(400).json({ message: "No pending verification." });

  try {
    record.otp = Math.floor(100000 + Math.random() * 900000).toString();
    record.createdAt = Date.now();

    await sendEmail(
      email,
      "Your new OTP for USA.edu.ph Verification",
      `Hello ${record.name},<br><br>Your new OTP: <strong>${record.otp}</strong><br>Valid for 10 minutes.`
    );

    res.json({ message: "A new OTP has been sent." });
  } catch (err) {
    console.error("Resend OTP error:", err);
    res.status(500).json({ message: "Failed to resend OTP." });
  }
});

app.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;
  const record = pendingVerifications[email];
  if (!record) return res.status(400).json({ message: "No pending verification." });

  if (Date.now() - record.createdAt > OTP_EXPIRATION) {
    delete pendingVerifications[email];
    return res.status(400).json({ message: "OTP expired. Please sign up again." });
  }

  if (record.otp !== otp) return res.status(400).json({ message: "Invalid OTP." });

  try {
    const newUser = new User(record);
    await newUser.save();
    delete pendingVerifications[email];
    res.status(201).json({ message: "Email verified and user registered!" });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: "Failed to register user." });
  }
});

// Admin login
app.post("/admin/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const admin = await Admin.findOne({ username: username.trim().toLowerCase() });
    if (!admin || !(await bcrypt.compare(password, admin.password)))
      return res.status(401).json({ message: "Invalid credentials." });

    res.json({
      message: "Admin login successful.",
      admin: {
        _id: admin._id,
        username: admin.username,
        name: admin.name,
        email: admin.email,
      },
    });
  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({ message: "Server error during admin login." });
  }
});

// User login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ message: "Invalid credentials." });

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
        verified: user.verified,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error during login." });
  }
});

// Helper to update users
async function applyUserUpdates(id, updates) {
  if (updates.password) {
    if (updates.password.length < 8) throw new Error("Password must be at least 8 characters.");
    const salt = await bcrypt.genSalt(10);
    updates.password = await bcrypt.hash(updates.password, salt);
  } else {
    delete updates.password;
  }
  const updated = await User.findByIdAndUpdate(id, updates, { new: true, runValidators: true }).select("-password");
  if (!updated) throw new Error("User not found.");
  return updated;
}

// Get users
app.get("/users", async (req, res) => {
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

// Add user
app.post("/users", async (req, res) => {
  const { name, email, id_number, password, department, course, yearLevel, role } = req.body;
  if (!name || !email || !id_number || !password || !department || !course || !yearLevel || !role)
    return res.status(400).json({ message: "All fields are required." });

  if (!["Student", "Faculty", "Staff"].includes(role))
    return res.status(400).json({ message: "Invalid role." });

  if (!email.toLowerCase().endsWith("@usa.edu.ph"))
    return res.status(400).json({ message: "Email must be @usa.edu.ph." });

  if (password.length < 8)
    return res.status(400).json({ message: "Password must be at least 8 characters." });

  try {
    if (await User.findOne({ email: email.toLowerCase() }))
      return res.status(409).json({ message: "Email is already registered." });

    await new User({
      name,
      email: email.toLowerCase(),
      id_number,
      password,
      department,
      course,
      yearLevel,
      role,
    }).save();
    res.status(201).json({ message: "User added successfully." });
  } catch (err) {
    console.error("Add user error:", err);
    res.status(500).json({ message: "Failed to add user." });
  }
});

// Delete user
app.delete("/users/:id", async (req, res) => {
  try {
    const result = await User.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ message: "User not found." });
    res.json({ message: "User deleted successfully." });
  } catch (err) {
    console.error("Delete user error:", err);
    res.status(500).json({ message: "Failed to delete user." });
  }
});

// Full update user
app.put("/users/:id", async (req, res) => {
  try {
    const updated = await applyUserUpdates(req.params.id, { ...req.body });
    res.json(updated);
  } catch (err) {
    console.error("Update user error:", err);
    res.status(err.message === "User not found." ? 404 : 400).json({ message: err.message });
  }
});

// Patch verified flag
app.patch("/users/:id", async (req, res) => {
  if (!Object.prototype.hasOwnProperty.call(req.body, "verified"))
    return res.status(400).json({ message: "Only 'verified' can be patched." });

  try {
    const updated = await applyUserUpdates(req.params.id, { verified: req.body.verified });
    res.json(updated);
  } catch (err) {
    console.error("Patch user error:", err);
    res.status(err.message === "User not found." ? 404 : 400).json({ message: err.message });
  }
});

// Reservation schema
const participantSchema = new mongoose.Schema({
  name: String,
  courseYear: String,
  department: String,
  idNumber: String,
});
const reservationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  datetime: { type: Date, required: true },
  numUsers: { type: Number, required: true },
  purpose: { type: String, required: true },
  location: { type: String, required: true },
  roomName: { type: String, required: true },
  participants: [participantSchema],
  status: { type: String, default: "Pending" },
  created_at: { type: Date, default: nowPH },
});
const Reservation = mongoose.model("Reservation", reservationSchema);

// Create reservation
app.post("/reservations", async (req, res) => {
  try {
    const { userId, datetime, numUsers, purpose, location, roomName, participants } = req.body;
    if (!userId) return res.status(400).json({ message: "userId is required." });
    await new Reservation({ userId, datetime, numUsers, purpose, location, roomName, participants }).save();
    res.status(201).json({ message: "Reservation created successfully!" });
  } catch (err) {
    console.error("Reservation error:", err);
    res.status(500).json({ error: "Failed to create reservation." });
  }
});

// Get reservations by user
app.get("/reservations/user/:userId", async (req, res) => {
  try {
    const reservations = await Reservation.find({ userId: req.params.userId });
    res.json(reservations);
  } catch (err) {
    console.error("Fetch reservations error:", err);
    res.status(500).json({ error: "Failed to fetch reservations." });
  }
});

// Get all reservations
app.get("/reservations", async (req, res) => {
  try {
    const reservations = await Reservation.find().populate("userId", "name email department course role");
    res.json(reservations);
  } catch (err) {
    console.error("Fetch all reservations error:", err);
    res.status(500).json({ error: "Failed to fetch reservations." });
  }
});

// Verify admin password
app.post("/admin/verify-password", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: "Username and password required." });
  try {
    const admin = await Admin.findOne({ username: username.trim().toLowerCase() });
    if (!admin) return res.status(404).json({ message: "Admin not found." });
    if (!(await bcrypt.compare(password, admin.password))) return res.status(401).json({ message: "Incorrect password." });
    res.json({ message: "Password verified successfully." });
  } catch (err) {
    console.error("Verify admin password error:", err);
    res.status(500).json({ message: "Failed to verify password." });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
