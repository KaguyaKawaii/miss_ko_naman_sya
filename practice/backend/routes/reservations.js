const express = require("express");
const router = express.Router();
const Reservation = require("../models/Reservation");

// POST /reservations  →  create a reservation
router.post("/", async (req, res) => {
  const { userId, room, date, startTime, purpose } = req.body;

  // Basic validation
  if (!userId || !room || !date || !startTime || !purpose) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    // Combine date + startTime → JS Date
    // Assumes date = "YYYY-MM-DD" and startTime = "HH:mm" (24‑hour)
    const startDateTime = new Date(`${date}T${startTime}:00`);

    // +2 hours (7200000 ms)
    const endDateTime = new Date(startDateTime.getTime() + 2 * 60 * 60 * 1000);

    // Format endTime back to "HH:mm"
    const endTime = endDateTime.toTimeString().slice(0, 5);

    const newReservation = new Reservation({
      userId,
      room,
      date,
      startTime, // keep original start
      endTime,   // auto‑calculated
      purpose,
    });

    await newReservation.save();

    res.status(201).json({
      message: "Reservation submitted successfully!",
      reservation: newReservation,
    });
  } catch (err) {
    console.error("Reservation submission error:", err);
    res.status(500).json({ message: "Reservation submission failed." });
  }
});

module.exports = router;
