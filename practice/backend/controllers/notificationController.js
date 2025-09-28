const Notification = require("../models/Notification");
const Admin = require("../models/Admin");
const User = require("../models/User");

// 📌 Get all notifications
exports.getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find()
      .sort({ createdAt: -1 })
      .populate("reservationId userId");
    res.status(200).json(notifications);
  } catch (err) {
    console.error("Fetch all notifications error:", err);
    res.status(500).json({ message: "Failed to fetch notifications." });
  }
};

// 📌 Create a new notification
// 📌 Create a new notification
exports.createNotification = async (req, res) => {
  try {
    const { userId, message, status, reservationId, type, reportId } = req.body;

    const notificationsToSave = [];

    // ✅ Always notify the user (if provided)
    if (userId) {
      notificationsToSave.push(
        new Notification({
          userId,
          message,
          status: status || "New",
          reservationId: reservationId || null,
          type: type || "system",
          isRead: false,
          dismissed: false,
        })
      );
    }

    // ✅ Handle reservation notifications (existing)
    if (type === "reservation") {
      const staff = await User.find({ role: "staff" });
      const admins = await Admin.find();

      staff.forEach((u) => {
        notificationsToSave.push(
          new Notification({
            userId: u._id,
            message: `📅 Reservation request on your floor: ${reservationId || ""}`,
            status: "New",
            reservationId: reservationId || null,
            type: "reservation",
            isRead: false,
            dismissed: false,
          })
        );
      });

      admins.forEach((a) => {
        notificationsToSave.push(
          new Notification({
            userId: a._id,
            message: `📅 New reservation created by a user.`,
            status: "New",
            reservationId: reservationId || null,
            type: "reservation",
            isRead: false,
            dismissed: false,
          })
        );
      });
    }

    // ✅ Handle report notifications (NEW)
    if (type === "report") {
      const staff = await User.find({ role: "staff" });

      staff.forEach((u) => {
        notificationsToSave.push(
          new Notification({
            userId: u._id,
            message: `🛠️ New report submitted: ${message}`,
            status: "New",
            type: "report",
            reportId: reportId || null,
            isRead: false,
            dismissed: false,
          })
        );
      });
    }

    // ✅ Save all notifications
    const saved = await Notification.insertMany(notificationsToSave);

    // ✅ Emit via Socket.IO
    const io = req.app.get("io");
    if (io) {
      saved.forEach((notif) => {
        if (notif.userId) {
          io.to(notif.userId.toString()).emit("notification", notif);
        }
      });

      // Broadcast to staff room if type is report
      if (type === "report") {
        saved.forEach((notif) => {
          io.to("staff").emit("notification", notif);
        });
      }

      // Keep your reservation broadcast for admins & staff
      if (type === "reservation") {
        saved.forEach((notif) => {
          io.to("admin").emit("notification", notif);
          io.to("staff").emit("notification", notif);
        });
      }
    }

    res.status(201).json(saved);
  } catch (err) {
    console.error("Create notification error:", err);
    res.status(500).json({ message: "Failed to create notification." });
  }
};


// 📌 Get only report notifications
exports.getReportNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      type: { $regex: "^report$", $options: "i" },
    }).sort({ createdAt: -1 });

    res.status(200).json(notifications);
  } catch (err) {
    console.error("Fetch report notifications error:", err);
    res.status(500).json({ message: "Failed to fetch report notifications." });
  }
};

// 📌 Mark single notification as read
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    if (!notification)
      return res.status(404).json({ message: "Notification not found." });
    res.status(200).json(notification);
  } catch (err) {
    console.error("Mark as read error:", err);
    res.status(500).json({ message: "Failed to update notification." });
  }
};

// 📌 Mark as dismissed
exports.markAsDismissed = async (req, res) => {
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
};

// 📌 Get notifications for a specific user
exports.getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.params.userId })
      .sort({ createdAt: -1 })
      .populate("reservationId");

    res.status(200).json(notifications);
  } catch (err) {
    console.error("Fetch notifications error:", err);
    res.status(500).json({ message: "Failed to fetch notifications." });
  }
};

// 📌 Get notifications linked to a reservation
exports.getByReservation = async (req, res) => {
  try {
    const notifications = await Notification.find({
      reservationId: req.params.id,
    }).sort({ createdAt: -1 });

    res.status(200).json(notifications);
  } catch (err) {
    console.error("Fetch by-reservation notifications error:", err);
    res.status(500).json({ message: "Failed to fetch notifications." });
  }
};

// 📌 Delete a notification
exports.deleteNotification = async (req, res) => {
  try {
    const deleted = await Notification.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ message: "Notification not found." });

    res.status(200).json({ message: "Notification deleted successfully." });
  } catch (err) {
    console.error("Delete notification error:", err);
    res.status(500).json({ message: "Failed to delete notification." });
  }
};

// 📌 Mark notification as expired
exports.markAsExpired = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { status: "Expired" },
      { new: true }
    );
    if (!notification)
      return res.status(404).json({ message: "Notification not found." });
    res.status(200).json(notification);
  } catch (err) {
    console.error("Mark as expired error:", err);
    res.status(500).json({ message: "Failed to update notification." });
  }
};

// 📌 Mark all as read for a user
exports.markAllAsRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { userId: req.params.userId, isRead: false },
      { $set: { isRead: true } }
    );

    res
      .status(200)
      .json({ message: "All notifications marked as read", result });
  } catch (err) {
    console.error("Mark all as read error:", err);
    res.status(500).json({ message: "Failed to mark all notifications as read." });
  }
};
