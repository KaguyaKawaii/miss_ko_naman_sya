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

    const otpEmailTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>OTP Verification - USA-FLD LRC</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background-color: #ffffff;
                padding: 20px;
                color: #333333;
            }
            
            .email-container {
                max-width: 600px;
                margin: 0 auto;
                background: white;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
                border: 1px solid #e0e0e0;
            }
            
            .email-header {
                background: #ffffff;
                color: #CC0000;
                padding: 30px 20px;
                text-align: center;
                border-bottom: 2px solid #CC0000;
            }
            
            .email-header h1 {
                font-size: 28px;
                font-weight: 600;
                margin-bottom: 8px;
            }
            
            .email-header p {
                font-size: 16px;
                color: #666666;
            }
            
            .email-body {
                padding: 35px 30px;
                color: #333333;
            }
            
            .greeting {
                font-size: 18px;
                margin-bottom: 20px;
                color: #444444;
            }
            
            .otp-container {
                background: #ffffff;
                border: 2px solid #CC0000;
                border-radius: 8px;
                padding: 25px;
                text-align: center;
                margin: 25px 0;
            }
            
            .otp-code {
                font-size: 42px;
                font-weight: bold;
                color: #CC0000;
                letter-spacing: 8px;
                margin: 15px 0;
                font-family: 'Courier New', monospace;
            }
            
            .instructions {
                background: #ffffff;
                border-left: 3px solid #CC0000;
                padding: 20px;
                margin: 25px 0;
                border-radius: 0 4px 4px 0;
            }
            
            .instructions h3 {
                color: #CC0000;
                margin-bottom: 12px;
                font-size: 16px;
                font-weight: 600;
            }
            
            .instructions ul {
                padding-left: 20px;
            }
            
            .instructions li {
                margin-bottom: 8px;
                color: #555555;
                line-height: 1.5;
            }
            
            .warning {
                background: #ffffff;
                border: 1px solid #CC0000;
                border-radius: 6px;
                padding: 15px;
                margin: 20px 0;
                text-align: center;
                color: #CC0000;
                font-weight: 500;
            }
            
            .email-footer {
                background: #ffffff;
                padding: 25px;
                text-align: center;
                color: #666666;
                font-size: 14px;
                border-top: 1px solid #e0e0e0;
            }
            
            .contact-info {
                margin-top: 15px;
                padding-top: 15px;
                border-top: 1px solid #e0e0e0;
            }
            
            .contact-info a {
                color: #CC0000;
                text-decoration: none;
            }
            
            .button {
                display: inline-block;
                background: #CC0000;
                color: white;
                padding: 12px 30px;
                text-decoration: none;
                border-radius: 4px;
                font-weight: 500;
                margin: 10px 0;
                border: none;
                cursor: pointer;
            }
            
            .info-item {
                margin-bottom: 12px;
                padding-bottom: 12px;
                border-bottom: 1px solid #f0f0f0;
            }
            
            .info-label {
                font-weight: 600;
                color: #CC0000;
                display: inline-block;
                width: 120px;
            }
            
            .info-value {
                color: #333333;
            }
            
            @media (max-width: 600px) {
                .email-body {
                    padding: 25px 20px;
                }
                
                .otp-code {
                    font-size: 36px;
                    letter-spacing: 6px;
                }
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="email-header">
                <h1>USA-FLD LRC</h1>
                <p>Learning Resource Center</p>
            </div>
            
            <div class="email-body">
                <div class="greeting">
                    <p>Hello <strong>${name}</strong>,</p>
                </div>
                
                <p>Thank you for registering with USA-FLD Learning Resource Center. To complete your registration, please use the following One-Time Password (OTP) to verify your email address.</p>
                
                <div class="otp-container">
                    <p style="margin-bottom: 15px; color: #666666; font-size: 15px;">Your verification code:</p>
                    <div class="otp-code">${otp}</div>
                    <p style="color: #666666; font-size: 14px;">This code will expire in 5 minutes</p>
                </div>
                
                <div class="instructions">
                    <h3>Important Instructions:</h3>
                    <ul>
                        <li>Enter this OTP on the verification page to complete your registration</li>
                        <li>Do not share this code with anyone for security reasons</li>
                        <li>If you didn't request this code, please ignore this email</li>
                        <li>For security purposes, this OTP will expire in 5 minutes</li>
                    </ul>
                </div>
                
                <p style="margin-top: 25px; color: #555555;">If you have any questions, please don't hesitate to contact our support team.</p>
                
                <p style="margin-top: 20px; font-size: 14px; color: #666666;">
                    Best regards,<br>
                    <strong>USA-FLD LRC Team</strong>
                </p>
            </div>
            
            <div class="email-footer">
                <p><strong>USA-FLD Learning Resource Center</strong></p>
                <p>University of San Agustin - Fort San Pedro Drive, Iloilo City, Philippines</p>
                <div class="contact-info">
                    <p>Email: <a href="mailto:lrc-support@usa.edu.ph">lrc-support@usa.edu.ph</a> | Phone: (033) 123-4567</p>
                </div>
                <p style="margin-top: 15px; font-size: 12px; color: #999999;">© ${new Date().getFullYear()} USA-FLD LRC. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;

    await sendEmail({
      to: email,
      subject: "Your OTP for USA-FLD LRC Registration",
      html: otpEmailTemplate,
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

    const welcomeEmailTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to USA-FLD LRC</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background-color: #ffffff;
                padding: 20px;
                color: #333333;
            }
            
            .email-container {
                max-width: 600px;
                margin: 0 auto;
                background: white;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
                border: 1px solid #e0e0e0;
            }
            
            .email-header {
                background: #ffffff;
                color: #CC0000;
                padding: 40px 20px;
                text-align: center;
                border-bottom: 2px solid #CC0000;
            }
            
            .email-header h1 {
                font-size: 32px;
                font-weight: 600;
                margin-bottom: 10px;
            }
            
            .email-header p {
                font-size: 18px;
                color: #666666;
            }
            
            .email-body {
                padding: 40px 30px;
                color: #333333;
            }
            
            .welcome-message {
                text-align: center;
                margin-bottom: 30px;
            }
            
            .welcome-message h2 {
                color: #CC0000;
                font-size: 28px;
                margin-bottom: 15px;
            }
            
            .user-info {
                background: #ffffff;
                border-radius: 6px;
                padding: 25px;
                margin: 25px 0;
                border-left: 3px solid #CC0000;
            }
            
            .user-info h3 {
                color: #CC0000;
                margin-bottom: 18px;
                font-size: 18px;
                font-weight: 600;
            }
            
            .info-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 15px;
            }
            
            .info-item {
                margin-bottom: 12px;
                padding-bottom: 12px;
                border-bottom: 1px solid #f0f0f0;
            }
            
            .info-label {
                font-weight: 600;
                color: #CC0000;
                display: block;
                margin-bottom: 4px;
            }
            
            .info-value {
                color: #333333;
            }
            
            .features {
                background: #ffffff;
                border-radius: 6px;
                padding: 25px;
                margin: 30px 0;
                border: 1px solid #e0e0e0;
            }
            
            .features h3 {
                color: #CC0000;
                text-align: center;
                margin-bottom: 20px;
                font-size: 20px;
                font-weight: 600;
            }
            
            .feature-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
            }
            
            .feature-item {
                text-align: center;
                padding: 15px;
            }
            
            .feature-title {
                font-weight: 600;
                color: #CC0000;
                margin-bottom: 8px;
                font-size: 15px;
            }
            
            .feature-item p {
                color: #555555;
                font-size: 14px;
                line-height: 1.4;
            }
            
            .next-steps {
                background: #ffffff;
                border: 1px solid #CC0000;
                border-radius: 6px;
                padding: 20px;
                margin: 25px 0;
            }
            
            .next-steps h3 {
                color: #CC0000;
                margin-bottom: 15px;
                font-weight: 600;
            }
            
            .next-steps ul {
                padding-left: 20px;
            }
            
            .next-steps li {
                margin-bottom: 10px;
                color: #555555;
                line-height: 1.5;
            }
            
            .cta-button {
                text-align: center;
                margin: 30px 0;
            }
            
            .button {
                display: inline-block;
                background: #CC0000;
                color: white;
                padding: 15px 40px;
                text-decoration: none;
                border-radius: 4px;
                font-weight: 600;
                font-size: 16px;
                border: none;
            }
            
            .email-footer {
                background: #ffffff;
                padding: 25px;
                text-align: center;
                color: #666666;
                font-size: 14px;
                border-top: 1px solid #e0e0e0;
            }
            
            .contact-info {
                margin-top: 15px;
                padding-top: 15px;
                border-top: 1px solid #e0e0e0;
            }
            
            .contact-info a {
                color: #CC0000;
                text-decoration: none;
            }
            
            @media (max-width: 600px) {
                .email-body {
                    padding: 25px 20px;
                }
                
                .info-grid,
                .feature-grid {
                    grid-template-columns: 1fr;
                }
                
                .feature-item {
                    padding: 10px;
                }
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="email-header">
                <h1>Welcome to USA-FLD LRC</h1>
                <p>Learning Resource Center</p>
            </div>
            
            <div class="email-body">
                <div class="welcome-message">
                    <h2>Registration Successful!</h2>
                    <p>Welcome to the University of San Agustin - Flexible Learning Delivery Learning Resource Center</p>
                </div>
                
                <p>Dear <strong>${tempUser.name}</strong>,</p>
                
                <p>We are delighted to inform you that your account has been successfully created and verified. You now have access to all the resources and services offered by our Learning Resource Center.</p>
                
                <div class="user-info">
                    <h3>Your Account Information</h3>
                    <div class="info-grid">
                        <div class="info-item">
                            <div class="info-label">Name:</div>
                            <div class="info-value">${tempUser.name}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Email:</div>
                            <div class="info-value">${tempUser.email}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">ID Number:</div>
                            <div class="info-value">${tempUser.id_number}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Role:</div>
                            <div class="info-value">${tempUser.role}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Department:</div>
                            <div class="info-value">${tempUser.department}</div>
                        </div>
                        ${tempUser.role === 'Student' ? `
                        <div class="info-item">
                            <div class="info-label">Course:</div>
                            <div class="info-value">${tempUser.course}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Year Level:</div>
                            <div class="info-value">${tempUser.year_level}</div>
                        </div>
                        ` : ''}
                    </div>
                </div>
                
                <div class="features">
                    <h3>What You Can Access</h3>
                    <div class="feature-grid">
                        <div class="feature-item">
                            <div class="feature-title">Digital Library</div>
                            <p>Access thousands of e-books, journals, and research materials</p>
                        </div>
                        <div class="feature-item">
                            <div class="feature-title">Learning Resources</div>
                            <p>Download course materials, presentations, and study guides</p>
                        </div>
                        <div class="feature-item">
                            <div class="feature-title">Research Tools</div>
                            <p>Utilize advanced research databases and citation tools</p>
                        </div>
                        <div class="feature-item">
                            <div class="feature-title">Online Reservations</div>
                            <p>Book study rooms and reserve physical materials online</p>
                        </div>
                    </div>
                </div>
                
                <div class="next-steps">
                    <h3>Next Steps</h3>
                    <ul>
                        <li>Log in to your account using your credentials</li>
                        <li>Explore the available resources in our digital library</li>
                        <li>Update your profile with additional information</li>
                        <li>Check out our upcoming workshops and training sessions</li>
                    </ul>
                </div>
                
                <div class="cta-button">
                    <a href="#" class="button">Access Your Account Now</a>
                </div>
                
                <p style="color: #555555;">If you have any questions or need assistance, our support team is always ready to help you make the most of our resources.</p>
                
                <p style="margin-top: 25px; font-size: 14px; color: #666666;">
                    Best regards,<br>
                    <strong>USA-FLD LRC Team</strong>
                </p>
            </div>
            
            <div class="email-footer">
                <p><strong>USA-FLD Learning Resource Center</strong></p>
                <p>University of San Agustin - Fort San Pedro Drive, Iloilo City, Philippines</p>
                <div class="contact-info">
                    <p>Email: <a href="mailto:lrc-support@usa.edu.ph">lrc-support@usa.edu.ph</a> | Phone: (033) 123-4567</p>
                    <p>Hours: Monday-Friday 8:00 AM - 5:00 PM</p>
                </div>
                <p style="margin-top: 15px; font-size: 12px; color: #999999;">© ${new Date().getFullYear()} USA-FLD Learning Resource Center. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;

    await sendEmail({
      to: email,
      subject: "Welcome to USA-FLD Learning Resource Center!",
      html: welcomeEmailTemplate,
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

    const resendOtpTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New OTP - USA-FLD LRC</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background-color: #ffffff;
                padding: 20px;
                color: #333333;
            }
            
            .email-container {
                max-width: 600px;
                margin: 0 auto;
                background: white;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
                border: 1px solid #e0e0e0;
            }
            
            .email-header {
                background: #ffffff;
                color: #CC0000;
                padding: 30px 20px;
                text-align: center;
                border-bottom: 2px solid #CC0000;
            }
            
            .email-header h1 {
                font-size: 28px;
                font-weight: 600;
                margin-bottom: 8px;
            }
            
            .email-header p {
                font-size: 16px;
                color: #666666;
            }
            
            .email-body {
                padding: 35px 30px;
                color: #333333;
            }
            
            .greeting {
                font-size: 18px;
                margin-bottom: 20px;
                color: #444444;
            }
            
            .otp-container {
                background: #ffffff;
                border: 2px solid #CC0000;
                border-radius: 8px;
                padding: 25px;
                text-align: center;
                margin: 25px 0;
            }
            
            .otp-code {
                font-size: 42px;
                font-weight: bold;
                color: #CC0000;
                letter-spacing: 8px;
                margin: 15px 0;
                font-family: 'Courier New', monospace;
            }
            
            .note {
                background: #ffffff;
                border: 1px solid #CC0000;
                border-radius: 6px;
                padding: 15px;
                margin: 20px 0;
                text-align: center;
                color: #CC0000;
                font-weight: 500;
            }
            
            .email-footer {
                background: #ffffff;
                padding: 25px;
                text-align: center;
                color: #666666;
                font-size: 14px;
                border-top: 1px solid #e0e0e0;
            }
            
            .contact-info {
                margin-top: 15px;
                padding-top: 15px;
                border-top: 1px solid #e0e0e0;
            }
            
            .contact-info a {
                color: #CC0000;
                text-decoration: none;
            }
            
            @media (max-width: 600px) {
                .email-body {
                    padding: 25px 20px;
                }
                
                .otp-code {
                    font-size: 36px;
                    letter-spacing: 6px;
                }
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="email-header">
                <h1>USA-FLD LRC</h1>
                <p>New OTP Request</p>
            </div>
            
            <div class="email-body">
                <div class="greeting">
                    <p>Hello <strong>${tempUser.name}</strong>,</p>
                </div>
                
                <p>We received your request for a new One-Time Password (OTP). Here is your new verification code:</p>
                
                <div class="otp-container">
                    <p style="margin-bottom: 15px; color: #666666; font-size: 15px;">Your new verification code:</p>
                    <div class="otp-code">${newOtp}</div>
                    <p style="color: #666666; font-size: 14px;">This code will expire in 5 minutes</p>
                </div>
                
                <div class="note">
                    <strong>Note:</strong> Your previous OTP has been deactivated. Please use this new code to complete your registration.
                </div>
                
                <p>If you didn't request a new OTP, please contact our support team immediately.</p>
                
                <p style="margin-top: 20px; font-size: 14px; color: #666666;">
                    Best regards,<br>
                    <strong>USA-FLD LRC Team</strong>
                </p>
            </div>
            
            <div class="email-footer">
                <p><strong>USA-FLD Learning Resource Center</strong></p>
                <p>University of San Agustin - Fort San Pedro Drive, Iloilo City, Philippines</p>
                <div class="contact-info">
                    <p>Email: <a href="mailto:lrc-support@usa.edu.ph">lrc-support@usa.edu.ph</a> | Phone: (033) 123-4567</p>
                </div>
                <p style="margin-top: 15px; font-size: 12px; color: #999999;">© ${new Date().getFullYear()} USA-FLD LRC. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;

    await sendEmail({
      to: email,
      subject: "Your New OTP for USA-FLD LRC Registration",
      html: resendOtpTemplate,
    });

    res.status(200).json({ message: "OTP resent successfully." });
  } catch (err) {
    console.error("Resend OTP error:", err);
    res.status(500).json({ message: "Failed to resend OTP." });
  }
};