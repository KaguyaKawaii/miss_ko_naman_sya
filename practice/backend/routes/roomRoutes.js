const express = require("express");
const router = express.Router();
const Room = require("../models/Room");

// GET /rooms — fetch all active rooms, sorted by floor and room name
router.get("/", async (req, res) => {
  try {
    const rooms = await Room.find({ isActive: true }).sort({ floor: 1, room: 1 });
    res.status(200).json(rooms);
  } catch (err) {
    console.error("❌ Error fetching rooms:", err);
    res.status(500).json({ error: "Failed to fetch rooms" });
  }
});

module.exports = router;
