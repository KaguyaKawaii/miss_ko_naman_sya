const express = require("express");
const router = express.Router();
const forgotPasswordController = require("../controllers/forgotPasswordController");

// Request OTP
router.post("/forgot-password", forgotPasswordController.requestOtp);

// Verify OTP + reset password
router.post("/verify-otp", forgotPasswordController.verifyOtpAndResetPassword);

module.exports = router;
