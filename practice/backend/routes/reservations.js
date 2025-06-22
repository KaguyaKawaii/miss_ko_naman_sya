const express = require("express");
const router = express.Router();
const Reservation = require("../models/Reservation");
const Notification = require("../models/Notification");

// GET all reservations (admin)
router.get("/", async (req, res) => {
  try {
    const reservations = await Reservation.find()
      .populate("userId")
      .sort({ datetime: -1 }); // use datetime for order
    res.status(200).json(reservations);
  } catch (err) {
    console.error("Error fetching all reservations:", err);
    res.status(500).json({ message: "Failed to fetch reservations." });
  }
});

// POST — Create reservation + Pending notification
router.post("/", async (req, res) => {
  try {
    const {
      userId,
      date,
      time,
      numUsers,
      purpose,
      location,
      roomName,
      participants,
    } = req.body;

    if (!userId || !date || !time || !location || !roomName || !purpose) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const datetime = new Date(`${date}T${time}`);
    if (isNaN(datetime.getTime())) {
      return res.status(400).json({ message: "Invalid date or time format." });
    }

    const endDatetime = new Date(datetime.getTime() + 2 * 60 * 60 * 1000);
    const now = new Date();

    const activeReservation = await Reservation.findOne({
      userId,
      endDatetime: { $gt: now },
    });

    if (activeReservation) {
      return res.status(400).json({
        message: "You already have an active reservation.",
      });
    }

    const dayStart = new Date(`${date}T00:00:00`);
    const nextDay = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

    const sameDayReservation = await Reservation.findOne({
      userId,
      datetime: { $gte: dayStart, $lt: nextDay },
    });

    if (sameDayReservation) {
      return res.status(400).json({
        message: "You already made a reservation for this day.",
      });
    }

    const overlappingReservation = await Reservation.findOne({
      roomName,
      location,
      $or: [{ datetime: { $lt: endDatetime }, endDatetime: { $gt: datetime } }],
    });

    if (overlappingReservation) {
      return res.status(400).json({
        message: "This room is already reserved for the selected time.",
      });
    }

    const reservation = await Reservation.create({
      userId,
      date,
      datetime,
      endDatetime,
      numUsers,
      purpose,
      location,
      roomName,
      participants,
      status: "Pending",
    });

    const formattedDate = new Date(reservation.date).toLocaleDateString(
      "en-PH",
      { year: "numeric", month: "long", day: "numeric" }
    );

    await Notification.create({
      userId,
      reservationId: reservation._id,
      message: `Your reservation for ${reservation.roomName} on ${formattedDate} is now pending approval.`,
      status: "Pending",
    });

    res.status(201).json(reservation);
  } catch (err) {
    console.error("Reservation creation error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
});

// GET user's reservations
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const reservations = await Reservation.find({ userId }).sort({
      datetime: -1,
    });
    res.status(200).json(reservations);
  } catch (err) {
    console.error("User reservations fetch error:", err);
    res.status(500).json({ message: "Failed to fetch reservations." });
  }
});

// GET active reservation for a user
router.get("/active/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const now = new Date();
    const activeReservation = await Reservation.findOne({
      userId,
      endDatetime: { $gt: now },
    });
    res.status(200).json(activeReservation);
  } catch (err) {
    console.error("Active reservation fetch error:", err);
    res.status(500).json({ message: "Failed to fetch active reservation." });
  }
});

// PUT — Update status + notification
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "Pending",
      "Approved",
      "Rejected",
      "Cancelled",
      "Ongoing",
      "Expired",
    ];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status." });
    }

    const reservation = await Reservation.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate("userId");

    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found." });
    }

    const formattedDate = new Date(reservation.date).toLocaleDateString(
      "en-PH",
      { year: "numeric", month: "long", day: "numeric" }
    );

    const messages = {
      Approved: `Your reservation for ${reservation.roomName} on ${formattedDate} has been approved.`,
      Rejected: `Your reservation for ${reservation.roomName} on ${formattedDate} has been rejected.`,
      Cancelled: `Your reservation for ${reservation.roomName} on ${formattedDate} has been cancelled.`,
      Ongoing: `Your reservation for ${reservation.roomName} on ${formattedDate} is now ongoing.`,
      Expired: `Your reservation for ${reservation.roomName} on ${formattedDate} has expired.`,
    };

    const message = messages[status];

    if (message) {
      await Notification.create({
        userId: reservation.userId._id,
        reservationId: reservation._id,
        message,
        status,
      });
    }

    res.status(200).json(reservation);
  } catch (err) {
    console.error("Update reservation error:", err);
    res.status(500).json({ message: "Failed to update reservation." });
  }
});

// DELETE — Remove reservation
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Reservation.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Reservation not found." });
    }
    res.status(200).json({ message: "Reservation deleted successfully." });
  } catch (err) {
    console.error("Delete reservation error:", err);
    res.status(500).json({ message: "Failed to delete reservation." });
  }
});

// ✅ GET — Check and auto-expire past pending reservations
router.get("/check-expired", async (req, res) => {
  try {
    const now = new Date();
    const expiredReservations = await Reservation.find({
      endDatetime: { $lte: now },
      status: "Pending",
    });

    const updates = expiredReservations.map(async (reservation) => {
      reservation.status = "Expired";
      await reservation.save();

      // Send expiration notification to user
      const formattedDate = new Date(reservation.date).toLocaleDateString(
        "en-PH",
        { year: "numeric", month: "long", day: "numeric" }
      );

      await Notification.create({
        userId: reservation.userId,
        reservationId: reservation._id,
        message: `Your reservation for ${reservation.roomName} on ${formattedDate} has expired.`,
        status: "Expired",
      });
    });

    await Promise.all(updates);

    res.status(200).json({
      message: `${expiredReservations.length} reservation(s) marked as expired.`,
    });
  } catch (err) {
    console.error("Check-expired error:", err);
    res.status(500).json({ message: "Failed to check expired reservations." });
  }
});


module.exports = router;
