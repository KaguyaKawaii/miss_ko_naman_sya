const Notification = require("../models/Notification");
const notificationService = require("../services/notificationService");
const Report = require("../models/Report"); // Make sure this path is correct


// 📌 Get all notifications (for admin)
exports.getAllNotifications = async (req, res) => {
  try {
    const { filter } = req.query;
    
    let query = {};
    
    // Apply filters
    if (filter === "unread") {
      query.isRead = false;
    } else if (filter && filter !== "all") {
      query.type = filter;
    }

    // ADMIN-ONLY NOTIFICATIONS
    query.$or = [
      { userId: null },
      { targetRole: "admin" },
      { targetRole: "all" }
    ];

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .populate("reservationId")
      .populate("reportId")
      .populate("userId", "name email");

    res.status(200).json(notifications);
  } catch (err) {
    console.error("Fetch all notifications error:", err);
    res.status(500).json({ message: "Failed to fetch notifications." });
  }
};

// 📌 Create a new notification using the service
exports.createNotification = async (req, res) => {
  try {
    const { userId, message, status, reservationId, type, reportId, targetRole, adminName, issue, roomName, date, startTime, endTime, newEndTime, userName, idNumber, staffName } = req.body;

    const notification = await notificationService.createNotification(
      {
        userId,
        message,
        status,
        reservationId,
        type,
        reportId,
        targetRole,
        adminName,
        issue,
        roomName,
        date,
        startTime,
        endTime,
        newEndTime,
        userName,
        idNumber,
        staffName
      },
      req.app.get("io")
    );

    res.status(201).json(notification);
  } catch (err) {
    console.error("Create notification error:", err);
    res.status(500).json({ message: "Failed to create notification." });
  }
};

// 📌 Get user-specific notifications
exports.getUserNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const { filter } = req.query;

    // ✅ FIXED: Only show notifications for THIS specific user
    let query = { 
      $or: [
        { userId: userId }, // Notifications specifically for this user
        { 
          targetRole: "user",
          userId: null // Only general user notifications (not assigned to specific users)
        }
      ]
    };

    if (filter === "unread") {
      query.isRead = false;
    } else if (filter && filter !== "all") {
      query.type = filter;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .populate("reservationId reportId");

    res.status(200).json(notifications);
  } catch (err) {
    console.error("Fetch user notifications error:", err);
    res.status(500).json({ message: "Failed to fetch notifications." });
  }
};

// 📌 Get staff-specific notifications
exports.getStaffNotifications = async (req, res) => {
  try {
    const { staffId } = req.params;
    const { filter } = req.query;

    if (!staffId) {
      return res.status(400).json({ message: "Staff ID is required" });
    }

    let query = {
      $or: [
        { userId: staffId },
        { targetRole: "staff" },
        { targetRole: "all" }
      ]
    };

    if (filter === "unread") {
      query.isRead = false;
    } else if (filter && filter !== "all") {
      query.type = filter;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .populate("reservationId")
      .populate("reportId")
      .populate("userId", "name email");

    res.status(200).json(notifications);
  } catch (err) {
    console.error("Fetch staff notifications error:", err);
    res.status(500).json({ message: "Failed to fetch notifications." });
  }
};

// 📌 Mark single notification as read
exports.markAsRead = async (req, res) => {
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
};

// 📌 Mark all as read for a user/admin/staff
exports.markAllAsRead = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // ✅ FIXED: Only mark notifications for THIS specific user as read
    const result = await Notification.updateMany(
      {
        $or: [
          { userId: userId }, // Notifications specifically for this user
          { 
            targetRole: "user",
            userId: null // Only general user notifications (not assigned to specific users)
          }
        ],
        isRead: false
      },
      { $set: { isRead: true } }
    );

    res.status(200).json({ 
      message: "All notifications marked as read", 
      modifiedCount: result.modifiedCount 
    });
  } catch (err) {
    console.error("Mark all as read error:", err);
    res.status(500).json({ message: "Failed to mark all notifications as read." });
  }
};

// 📌 Get unread count for a user
exports.getUnreadCount = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // ✅ FIXED: Only count notifications for THIS specific user
    const count = await Notification.countDocuments({
      $or: [
        { userId: userId }, // Notifications specifically for this user
        { 
          targetRole: "user",
          userId: null // Only general user notifications (not assigned to specific users)
        }
      ],
      isRead: false
    });

    res.status(200).json({ count });
  } catch (err) {
    console.error("Get unread count error:", err);
    res.status(500).json({ message: "Failed to get unread count." });
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