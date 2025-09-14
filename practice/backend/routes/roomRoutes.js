const express = require("express");
const router = express.Router();
const Room = require("../models/Room");
const logAction = require("../utils/logAction");

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

router.post("/", async (req, res) => {
  try {
    const room = await Room.create(req.body);

    // ✅ Log it
    logAction({
      req,
      userId: req.adminId, // assuming you set adminId in auth middleware
      role: "Admin",
      action: "Created Room",
      details: `Room: ${room.room}, Floor: ${room.floor}`,
    });

    res.status(201).json(room);
  } catch (err) {
    res.status(500).json({ error: "Failed to create room" });
  }
});


router.delete("/:id", async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);

    // ✅ Log it
    logAction({
      req,
      userId: req.adminId,
      role: "Admin",
      action: "Deleted Room",
      details: `Room ID: ${room._id}, Name: ${room.room}`,
    });

    res.json({ message: "Room deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete room" });
  }
});


module.exports = router;
