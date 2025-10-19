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