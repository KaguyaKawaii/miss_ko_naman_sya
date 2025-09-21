const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  try {
    if (!options.to) {
      console.error("⚠️ sendEmail skipped: No recipient email provided!", options);
      return;
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,  // <-- changed
        pass: process.env.EMAIL_PASS,  // <-- changed
      },
    });

    const mailOptions = {
      from: `"USA-FLD" <${process.env.EMAIL_USER}>`, // <-- changed
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully to:", options.to);
  } catch (error) {
    console.error("❌ Error sending email:", error);
    throw new Error("Email could not be sent");
  }
};

module.exports = sendEmail;
