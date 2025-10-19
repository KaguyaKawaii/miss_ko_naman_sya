const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const Admin = require("../models/Admin");
const Reservation = require("../models/Reservation");
const User = require("../models/User");
const SystemSettings = require("../models/SystemSettings");
const sendEmail = require("../utils/sendEmail");

// Helper function to generate OTP
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// Helper function to send OTP (using actual email service)
const sendOTP = async (email, otpCode, adminName = "Admin", loginTime = new Date(), ipAddress = "Unknown") => {
  try {
    const subject = "Secure Admin Access - One-Time Password Required";
    const formattedTime = loginTime.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      timeZoneName: 'short'
    });

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Admin Login Verification</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 20px;
            min-height: 100vh;
          }
          
          .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            border: 1px solid #e8e8e8;
          }
          
          .header {
            background: linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%);
            color: #ffffff;
            text-align: center;
            padding: 40px 30px;
            position: relative;
          }
          
          .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #f59e0b, #ef4444, #8b5cf6);
          }
          
          .university-logo {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 8px;
            letter-spacing: -0.5px;
          }
          
          .university-subtitle {
            font-size: 14px;
            opacity: 0.9;
            font-weight: 400;
          }
          
          .content {
            padding: 40px 30px;
          }
          
          .greeting {
            font-size: 18px;
            color: #1f2937;
            margin-bottom: 24px;
            line-height: 1.6;
          }
          
          .otp-section {
            background: #f8fafc;
            border: 2px solid #e2e8f0;
            border-radius: 12px;
            padding: 30px;
            text-align: center;
            margin: 30px 0;
          }
          
          .otp-label {
            font-size: 14px;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 12px;
            font-weight: 600;
          }
          
          .otp-code {
            font-size: 42px;
            font-weight: 700;
            color: #1e3a8a;
            letter-spacing: 8px;
            font-family: 'Courier New', monospace;
            background: #ffffff;
            padding: 20px;
            border-radius: 8px;
            border: 2px dashed #c7d2fe;
            display: inline-block;
            margin: 10px 0;
          }
          
          .expiry-notice {
            font-size: 14px;
            color: #ef4444;
            font-weight: 600;
            margin-top: 8px;
          }
          
          .details-section {
            background: #f0f9ff;
            border: 1px solid #bae6fd;
            border-radius: 8px;
            padding: 20px;
            margin: 25px 0;
          }
          
          .details-title {
            font-size: 16px;
            color: #0369a1;
            font-weight: 600;
            margin-bottom: 12px;
          }
          
          .detail-item {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #e0f2fe;
          }
          
          .detail-item:last-child {
            border-bottom: none;
          }
          
          .detail-label {
            color: #64748b;
            font-weight: 500;
          }
          
          .detail-value {
            color: #1e293b;
            font-weight: 600;
          }
          
          .security-section {
            background: #fef2f2;
            border: 1px solid #fecaca;
            border-radius: 8px;
            padding: 20px;
            margin: 25px 0;
          }
          
          .security-title {
            font-size: 16px;
            color: #dc2626;
            font-weight: 600;
            margin-bottom: 8px;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          .security-icon {
            font-size: 18px;
          }
          
          .security-text {
            color: #7f1d1d;
            font-size: 14px;
            line-height: 1.5;
          }
          
          .footer {
            text-align: center;
            padding: 30px;
            background: #f8fafc;
            border-top: 1px solid #e2e8f0;
          }
          
          .footer-text {
            color: #64748b;
            font-size: 12px;
            line-height: 1.6;
            margin-bottom: 8px;
          }
          
          .contact-info {
            color: #475569;
            font-size: 12px;
            margin-top: 15px;
          }
          
          .warning-badge {
            display: inline-block;
            background: #ef4444;
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            margin-left: 8px;
          }
          
          @media (max-width: 600px) {
            body {
              padding: 20px 10px;
            }
            
            .content {
              padding: 30px 20px;
            }
            
            .otp-code {
              font-size: 32px;
              letter-spacing: 6px;
              padding: 15px;
            }
            
            .header {
              padding: 30px 20px;
            }
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <!-- Header -->
          <div class="header">
            <div class="university-logo">University of San Agustin</div>
            <div class="university-subtitle">Administrative Portal Security</div>
          </div>
          
          <!-- Content -->
          <div class="content">
            <div class="greeting">
              Hello <strong>${adminName}</strong>,<br>
              You are attempting to access the Admin Portal. Please use the following verification code to complete your login.
            </div>
            
            <!-- OTP Section -->
            <div class="otp-section">
              <div class="otp-label">Your Verification Code</div>
              <div class="otp-code">${otpCode}</div>
              <div class="expiry-notice">⏰ Expires in 10 minutes</div>
            </div>
            
            <!-- Login Details -->
            <div class="details-section">
              <div class="details-title">Login Attempt Details</div>
              <div class="detail-item">
                <span class="detail-label">Request Time:</span>
                <span class="detail-value">${formattedTime}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Admin Account:</span>
                <span class="detail-value">${adminName}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">IP Address:</span>
                <span class="detail-value">${ipAddress}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">System:</span>
                <span class="detail-value">Admin Portal</span>
              </div>
            </div>
            
            <!-- Security Notice -->
            <div class="security-section">
              <div class="security-title">
                <span class="security-icon">⚠️</span>
                Security Advisory
              </div>
              <div class="security-text">
                • This OTP is valid for a single login session only<br>
                • Never share this code with anyone, including support staff<br>
                • Ensure you are on the official University of San Agustin portal<br>
                • If you didn't initiate this request, contact IT Security immediately
              </div>
            </div>
          </div>
          
          <!-- Footer -->
          <div class="footer">
            <div class="footer-text">
              This is an automated security message from the University of San Agustin Admin System.
            </div>
            <div class="footer-text">
              For security reasons, please do not forward or share this email.
            </div>
            <div class="contact-info">
              📧 IT Support: itsupport@usa.edu.ph | 📞 +63 (033) 123-4567
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
SECURE ADMIN ACCESS - ONE-TIME PASSWORD

Hello ${adminName},

You are attempting to access the Admin Portal. Use the following verification code:

OTP: ${otpCode}
Expires: 10 minutes

Login Details:
- Request Time: ${formattedTime}
- Admin Account: ${adminName}
- IP Address: ${ipAddress}
- System: Admin Portal

SECURITY NOTICE:
- This OTP is valid for single use only
- Never share this code with anyone
- Ensure you're on the official University portal
- Contact IT Security if you didn't initiate this request

University of San Agustin Admin System
IT Support: itsupport@usa.edu.ph | +63 (033) 123-4567
    `;

    await sendEmail({
      to: email,
      subject: subject,
      text: text,
      html: html
    });

    console.log(`✅ Professional OTP email sent to: ${email}`);
    return true;
  } catch (error) {
    console.error("❌ Failed to send professional OTP email:", error);
    return false;
  }
};

// Controller functions
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
    const ipAddress = req.ip || req.connection.remoteAddress || "Unknown";
    
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
    const otpSent = await sendOTP(admin.email, otpCode, admin.name, new Date(), ipAddress);
    
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
    const ipAddress = req.ip || req.connection.remoteAddress || "Unknown";
    
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
    const otpSent = await sendOTP(admin.email, otpCode, admin.name, new Date(), ipAddress);
    
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