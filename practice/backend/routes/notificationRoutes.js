const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");


// ✅ GET /notifications — fetch all notifications (general)
router.get("/", async (req, res) => {
  try {
    const notifications = await Notification.find()
      .sort({ createdAt: -1 })
      .populate("reservationId userId");
    res.status(200).json(notifications);
  } catch (err) {
    console.error("Fetch all notifications error:", err);
    res.status(500).json({ message: "Failed to fetch notifications." });
  }
});


// ✅ POST /notifications — create a notification
router.post("/", async (req, res) => {
  try {
    const { userId, message, status, reservationId, type } = req.body;

    const newNotification = new Notification({
      userId,
      message,
      status,
      reservationId,
      type,
    });

    await newNotification.save();

    // ✅ emit real-time socket event if available
    if (req.app.get("io")) {
      const io = req.app.get("io");
      io.emit("notification", newNotification);
    }

    res.status(201).json(newNotification);
  } catch (err) {
    console.error("Create notification error:", err);
    res.status(500).json({ message: "Failed to create notification." });
  }
});

// ✅ Get all report-type notifications for admin
router.get("/reports", async (req, res) => {
  try {
    const notifications = await Notification.find({
      type: { $regex: "^report$", $options: "i" } // Case-insensitive match
    }).sort({ createdAt: -1 });

    console.log("🔔 Fetched report notifications:", notifications.length);
    res.status(200).json(notifications);
  } catch (err) {
    console.error("❌ Error fetching report notifications:", err);
    res.status(500).json({ message: "Failed to fetch report notifications", error: err.message });
  }
});

// Mark as read route
router.patch('/notifications/:id/read', async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { status: 'read' },
      { new: true }
    );
    res.json(notification);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Dismiss route (doesn't delete, just marks as dismissed)
router.patch('/notifications/:id/dismiss', async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { dismissed: true },
      { new: true }
    );
    res.json(notification);
  } catch (err) {
    res.status(500).json({ message: err.message });
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
