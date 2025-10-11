const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const Admin = require("../models/Admin");
const Reservation = require("../models/Reservation");
const User = require("../models/User");
const SystemSettings = require("../models/SystemSettings");
const sendEmail = require("../utils/sendEmail"); // Import the email function

// Helper function to generate OTP
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// Helper function to send OTP (using actual email service)
const sendOTP = async (email, otpCode, adminName = "Admin") => {
  try {
    const subject = "Your Admin Login OTP - University of San Agustin";
    const html = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #f4f4f4; padding: 30px;">
        <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          
          <!-- HEADER -->
          <div style="background: linear-gradient(135deg, #b91c1c, #d97706); color: #ffffff; text-align: center; padding: 25px 20px;">
            <h2 style="margin: 0; font-size: 22px; letter-spacing: 0.5px;">Admin Login Verification</h2>
            <p style="margin: 5px 0 0; opacity: 0.9;">University of San Agustin</p>
          </div>

          <!-- BODY -->
          <div style="padding: 30px;">
            <p style="font-size: 16px; color: #333; margin: 0 0 10px;">Hi <strong>${adminName}</strong>,</p>
            <p style="font-size: 15px; color: #555; margin: 0 0 20px;">
              You are attempting to login to the Admin Portal. Use the following OTP to complete your authentication:
            </p>

            <!-- OTP CODE -->
            <div style="text-align: center; margin: 30px 0;">
              <div style="display: inline-block; background: #f8f9fa; padding: 20px 40px; border-radius: 10px; border: 2px dashed #b91c1c;">
                <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #b91c1c; font-family: monospace;">
                  ${otpCode}
                </div>
              </div>
            </div>

            <!-- SECURITY INFO -->
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #856404; font-size: 14px;">
                <strong>Security Notice:</strong> This OTP will expire in <strong>10 minutes</strong>. 
                Do not share this code with anyone.
              </p>
            </div>

            <p style="font-size: 13px; color: #999; text-align: center; margin-top: 30px;">
              This is an automated message from the <strong>University of San Agustin Admin System</strong>.<br>
              If you didn't request this OTP, please contact system administrator immediately.
            </p>
          </div>
        </div>
      </div>
    `;

    const text = `Your Admin Login OTP is: ${otpCode}. This code expires in 10 minutes.`;

    await sendEmail({
      to: email,
      subject: subject,
      text: text,
      html: html
    });

    console.log(`✅ OTP email sent to: ${email}`);
    return true;
  } catch (error) {
    console.error("❌ Failed to send OTP email:", error);
    return false;
  }
};

exports.registerAdmin = async (req, res) => {
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
};

exports.loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Find admin and include virtual field
    const admin = await Admin.findOne({ username: username.toLowerCase() });
    
    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // Check if account is locked
    if (admin.isLocked) {
      const remainingTime = Math.ceil((admin.lockUntil - Date.now()) / 1000 / 60);
      return res.status(423).json({ 
        message: `Account locked. Try again in ${remainingTime} minutes.`,
        locked: true,
        remainingTime 
      });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    
    if (!isMatch) {
      // Increment login attempts
      admin.loginAttempts += 1;
      
      // Lock account after 5 failed attempts for 5 minutes
      if (admin.loginAttempts >= 5) {
        admin.lockUntil = Date.now() + 5 * 60 * 1000; // 5 minutes
        await admin.save();
        return res.status(423).json({ 
          message: "Account locked due to too many failed attempts. Try again in 5 minutes.",
          locked: true,
          remainingTime: 5
        });
      }
      
      await admin.save();
      const remainingAttempts = 5 - admin.loginAttempts;
      return res.status(401).json({ 
        message: `Invalid credentials. ${remainingAttempts} attempts remaining.`,
        remainingAttempts 
      });
    }

    // Reset login attempts on successful password verification
    admin.loginAttempts = 0;
    admin.lockUntil = undefined;

    // Generate and send OTP
    const otpCode = generateOTP();
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    admin.otp = {
      code: otpCode,
      expiresAt: otpExpires
    };

    await admin.save();

    // Send OTP to admin's email using actual email service
    const otpSent = await sendOTP(admin.email, otpCode, admin.name);
    
    if (!otpSent) {
      // Clear OTP if email failed
      admin.otp = undefined;
      await admin.save();
      
      return res.status(500).json({ message: "Failed to send OTP. Please try again." });
    }

    res.status(200).json({
      message: "OTP sent to your email",
      requiresOTP: true,
      adminId: admin._id,
      email: admin.email // For display purposes only
    });

  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { adminId, otp } = req.body;
    
    if (!adminId || !otp) {
      return res.status(400).json({ message: "Admin ID and OTP are required." });
    }

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found." });
    }

    // Check if OTP exists and is not expired
    if (!admin.otp || !admin.otp.code || admin.otp.expiresAt < Date.now()) {
      return res.status(401).json({ message: "OTP has expired. Please request a new one." });
    }

    // Verify OTP
    if (admin.otp.code !== otp) {
      return res.status(401).json({ message: "Invalid OTP." });
    }

    // Clear OTP after successful verification
    admin.otp = undefined;
    await admin.save();

    // Return admin data for login success
    res.status(200).json({
      message: "Login successful",
      admin: {
        _id: admin._id,
        username: admin.username,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        createdAt: admin.createdAt,
        updatedAt: admin.updatedAt
      },
    });
  } catch (err) {
    console.error("OTP verification error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.resendOTP = async (req, res) => {
  try {
    const { adminId } = req.body;
    
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found." });
    }

    // Generate new OTP
    const otpCode = generateOTP();
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    admin.otp = {
      code: otpCode,
      expiresAt: otpExpires
    };

    await admin.save();

    // Send new OTP using actual email service
    const otpSent = await sendOTP(admin.email, otpCode, admin.name);
    
    if (!otpSent) {
      // Clear OTP if email failed
      admin.otp = undefined;
      await admin.save();
      
      return res.status(500).json({ message: "Failed to send OTP. Please try again." });
    }

    res.status(200).json({
      message: "New OTP sent to your email",
      email: admin.email
    });

  } catch (err) {
    console.error("Resend OTP error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ... rest of your existing methods remain the same
exports.getSummaryCounts = async (req, res) => {
  try {
    const reservations = await Reservation.countDocuments();
    const users = await User.countDocuments();

    res.status(200).json({ reservations, users });
  } catch (err) {
    console.error("Summary fetch error:", err);
    res.status(500).json({ message: "Failed to fetch summary counts." });
  }
};

exports.updateAdminProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, name, email } = req.body;

    if (!username || !name || !email) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const existingAdmin = await Admin.findOne({ 
      username: username.toLowerCase(), 
      _id: { $ne: id } 
    });
    
    if (existingAdmin) {
      return res.status(409).json({ message: "Username already exists." });
    }

    const updatedAdmin = await Admin.findByIdAndUpdate(
      id,
      {
        username: username.toLowerCase(),
        name,
        email,
        updatedAt: Date.now()
      },
      { new: true }
    );

    if (!updatedAdmin) {
      return res.status(404).json({ message: "Admin not found." });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      admin: {
        _id: updatedAdmin._id,
        username: updatedAdmin.username,
        name: updatedAdmin.name,
        email: updatedAdmin.email,
        role: updatedAdmin.role,
        createdAt: updatedAdmin.createdAt,
        updatedAt: updatedAdmin.updatedAt
      }
    });
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).json({ message: "Failed to update profile." });
  }
};

exports.updateAdminPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current password and new password are required." });
    }

    const admin = await Admin.findById(id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found." });
    }

    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect." });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: "New password must be at least 8 characters long." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    admin.password = hashedPassword;
    admin.updatedAt = Date.now();
    await admin.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully"
    });
  } catch (err) {
    console.error("Password update error:", err);
    res.status(500).json({ message: "Failed to update password." });
  }
};

exports.getSystemSettings = async (req, res) => {
  try {
    let settings = await SystemSettings.findOne();
    
    if (!settings) {
      settings = new SystemSettings({
        emailNotifications: true,
        reservationAlerts: true,
        systemAlerts: true,
        autoBackup: true,
        backupFrequency: "daily",
        sessionTimeout: 30,
        twoFactorAuth: false,
        loginAlerts: true,
        passwordExpiry: 90,
        smtpServer: "",
        smtpPort: 587,
        senderEmail: ""
      });
      await settings.save();
    }

    res.status(200).json({
      success: true,
      settings
    });
  } catch (err) {
    console.error("Get system settings error:", err);
    res.status(500).json({ message: "Failed to fetch system settings." });
  }
};

exports.updateSystemSettings = async (req, res) => {
  try {
    const settingsData = req.body;

    let settings = await SystemSettings.findOne();
    
    if (!settings) {
      settings = new SystemSettings(settingsData);
    } else {
      Object.assign(settings, settingsData);
      settings.updatedAt = Date.now();
    }

    await settings.save();

    res.status(200).json({
      success: true,
      message: "System settings updated successfully",
      settings
    });
  } catch (err) {
    console.error("Update system settings error:", err);
    res.status(500).json({ message: "Failed to update system settings." });
  }
};