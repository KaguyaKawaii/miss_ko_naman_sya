const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  logger: true,
});

const sendEmail = async ({ to, subject, text, html }) => {
  const mailOptions = {
    from: `"USA-FLD" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,   // optional — you can pass null or leave out if unused
    html,   // safe now because it's destructured from parameters
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
