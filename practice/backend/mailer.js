const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  logger: true,  // Enable logs
  // debug: true,   // Enable debug output
});

const sendEmail = async (to, subject, htmlContent) => {
  const mailOptions = {
    from: `"USA-FLD" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html: htmlContent,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent:', info.response);
  } catch (error) {
    console.error('❌ Email send error:', error);
    throw error;
  }
};

module.exports = sendEmail;
