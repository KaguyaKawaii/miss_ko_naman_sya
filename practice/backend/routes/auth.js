const express = require('express');
const router = express.Router();
const User = require('../models/User');
const sendEmail = require('../mailer');

// Register route
router.post('/signup', async (req, res) => {
  try {
    const { name, email, id_number, password, department, course, year_level } = req.body;

    // Basic validation
    if (!name || !email || !id_number || !password || !department || !course || !year_level) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    if (!email.endsWith('@usa.edu.ph')) {
      return res.status(400).json({ message: 'Email must end with @usa.edu.ph' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already used.' });

    const newUser = new User({
      name,
      email,
      id_number,
      password,
      department,
      course,
      year_level
    });

    await newUser.save();

    // Send welcome email
    await sendEmail(
      email,
      'Welcome to USA-FLD!',
      `<h3>Hi ${name},</h3><p>Your account was created successfully as a ${year_level} student of ${course} in the ${department} department!</p>`
    );

    res.status(201).json({ message: 'User registered successfully and email sent.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during signup.' });
  }
});

module.exports = router;
