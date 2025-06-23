const express = require("express");
const router = express.Router();
const Reservation = require("../models/Reservation");

const ROOMS = [
  { floor: "Ground Floor", room: "Discussion Room" },
  { floor: "2nd Floor", room: "Collaboration Corner" },
  { floor: "4th Floor", room: "Graduate Research Hub" },
  { floor: "5th Floor", room: "Faculty Corner" },
];

const TIME_SLOTS = [
  "07:00", "07:30", "08:00", "08:30", "09:00", "09:30",
  "10:00", "10:30", "11:00", "11:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00",
];

// GET /api/availability?date=yyyy-mm-dd&userId=xxxx
router.get("/availability", async (req, res) => {
  const { date, userId } = req.query;
  if (!date || !userId) {
    return res.status(400).json({ message: "Missing date or userId" });
  }

  try {
    const reservations = await Reservation.find({ date });

    const roomMap = {};

    // Fill each room with time slots
    for (const { floor, room } of ROOMS) {
      const occupied = [];

      for (const r of reservations) {
        if (r.location === floor && r.roomName === room) {
          const start = new Date(`${r.date}T${r.time}`);
          const end = new Date(start.getTime() + 2 * 60 * 60 * 1000); // 2 hours
          
          for (const slot of TIME_SLOTS) {
            const slotTime = new Date(`${r.date}T${slot}`);
            if (slotTime >= start && slotTime < end) {
              occupied.push({
                slot,
                who: r.userId.toString() === userId ? "You" : "Reserved",
                mine: r.userId.toString() === userId,
                status: r.status,
              });
            }
          }
        }
      }

      if (!roomMap[floor]) roomMap[floor] = [];
      roomMap[floor].push({ room, occupied });
    }

    // Flatten the map into an array
    const availability = Object.entries(roomMap).flatMap(([floor, rooms]) =>
      rooms.map((r) => ({ floor, room: r.room, occupied: r.occupied }))
    );

    res.json({ timeSlots: TIME_SLOTS, availability });
  } catch (err) {
    console.error("Error fetching availability:", err);
    res.status(500).json({ message: "Failed to fetch availability" });
  }
});

module.exports = router;
