const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");

// ✅ POST /notifications — create a notification
router.post("/", async (req, res) => {
  try {
    const { userId, message, status, reservationId } = req.body;

    const newNotification = new Notification({
      userId,
      message,
      status,
      reservationId,
    });

    await newNotification.save();

    // ✅ emit real-time socket event if available
    if (req.app.get("socketio")) {
      const io = req.app.get("socketio");
      io.emit("notification", newNotification);
    }

    res.status(201).json(newNotification);
  } catch (err) {
    console.error("Create notification error:", err);
    res.status(500).json({ message: "Failed to create notification." });
  }
});

// ✅ GET /notifications/user/:userId — get all notifications for a user
router.get("/user/:userId", async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.params.userId })
      .sort({ createdAt: -1 })
      .populate("reservationId");

    res.status(200).json(notifications);
  } catch (err) {
    console.error("Fetch notifications error:", err);
    res.status(500).json({ message: "Failed to fetch notifications." });
  }
});

// ✅ GET /notifications/by-reservation/:id — get notifications for a reservation
router.get("/by-reservation/:id", async (req, res) => {
  try {
    const notifications = await Notification.find({
      reservationId: req.params.id,
    }).sort({ createdAt: -1 });

    res.status(200).json(notifications);
  } catch (err) {
    console.error("Fetch by-reservation notifications error:", err);
    res.status(500).json({ message: "Failed to fetch notifications." });
  }
});

// ✅ PUT /notifications/:id/read — mark a notification as read
router.put("/:id/read", async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found." });
    }

    res.status(200).json(notification);
  } catch (err) {
    console.error("Mark as read error:", err);
    res.status(500).json({ message: "Failed to update notification." });
  }
});

// ✅ DELETE /notifications/:id — delete a notification
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Notification.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Notification not found." });
    }

    res.status(200).json({ message: "Notification deleted successfully." });
  } catch (err) {
    console.error("Delete notification error:", err);
    res.status(500).json({ message: "Failed to delete notification." });
  }
});

// ✅ PUT /notifications/:id/expire — mark a notification as expired
router.put("/:id/expire", async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { status: "Expired" },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found." });
    }

    res.status(200).json(notification);
  } catch (err) {
    console.error("Mark as expired error:", err);
    res.status(500).json({ message: "Failed to update notification." });
  }
});

// ✅ PUT /notifications/mark-all-read/:userId — mark all notifications as read for a user
router.put("/mark-all-read/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await Notification.updateMany(
      { userId, isRead: false },
      { $set: { isRead: true } }
    );

    res.status(200).json({ message: "All notifications marked as read", result });
  } catch (err) {
    console.error("Mark all as read error:", err);
    res.status(500).json({ message: "Failed to mark all notifications as read." });
  }
});


module.exports = router;
