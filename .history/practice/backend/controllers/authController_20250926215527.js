const User = require("../models/User");
const sendEmail = require("../mailer");

const tempUsers = new Map();

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

exports.signup = async (req, res) => {
  try {
    const { name, email, id_number, password, role, department, course, year_level } = req.body;

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
      html: `<p>Your OTP code is: <b>${otp}</b></p>`,
    });

    res.status(200).json({ message: "OTP sent to email." });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Server error during signup." });
  }
};

exports.verifyOtp = async (req, res) => {
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

    const newUser = new User({
      name: tempUser.name,
      email: tempUser.email,
      id_number: tempUser.id_number,
      password: tempUser.password,
      role: tempUser.role,
      department: tempUser.department,
      course: tempUser.course,
      year_level: tempUser.year_level,
    });

    await newUser.save();
    tempUsers.delete(email);

    await sendEmail({
      to: email,
      subject: "Welcome to USA-FLD Learning Resource Center!",
      html: `<p>Your account has been created successfully.</p>`,
    });

    res.status(201).json({ message: "User registered successfully." });
  } catch (err) {
    console.error("OTP verification error:", err);
    res.status(500).json({ message: "OTP verification failed." });
  }
};

exports.resendOtp = async (req, res) => {
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
      html: `<p>Your new OTP is: <b>${newOtp}</b></p>`,
    });

    res.status(200).json({ message: "OTP resent successfully." });
  } catch (err) {
    console.error("Resend OTP error:", err);
    res.status(500).json({ message: "Failed to resend OTP." });
  }
};

