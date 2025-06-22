const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");

// ✅ GET /notifications/user/:userId — get all notifications for a user
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .populate("reservationId"); // optionally include reservation details

    res.status(200).json(notifications);
  } catch (err) {
    console.error("Fetch notifications error:", err);
    res.status(500).json({ message: "Failed to fetch notifications." });
  }
});

// ✅ PUT /notifications/:id/read — mark a notification as read
router.put("/:id/read", async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findByIdAndUpdate(
      id,
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
    const { id } = req.params;

    const deleted = await Notification.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Notification not found." });
    }

    res.status(200).json({ message: "Notification deleted successfully." });
  } catch (err) {
    console.error("Delete notification error:", err);
    res.status(500).json({ message: "Failed to delete notification." });
  }
});

module.exports = router;
