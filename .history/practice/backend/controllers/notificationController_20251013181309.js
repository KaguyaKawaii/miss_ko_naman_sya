const Notification = require("../models/Notification");
const notificationService = require("../services/notificationService");
const User = require("../models/User");

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

// 📌 Create notifications for all participants in a reservation
exports.createParticipantNotifications = async (req, res) => {
  try {
    const { reservationId, message, status, type, roomName, date, startTime, endTime, excludeUserId } = req.body;

    if (!reservationId) {
      return res.status(400).json({ message: "Reservation ID is required" });
    }

    // Find the reservation to get participants
    const Reservation = require("../models/Reservation");
    const reservation = await Reservation.findById(reservationId).populate("userId");
    
    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    const notifications = [];
    const io = req.app.get("io");

    // ✅ NOTIFY MAIN USER (if not excluded)
    if (!excludeUserId || reservation.userId._id.toString() !== excludeUserId) {
      const mainUserNotification = await notificationService.createNotification(
        {
          userId: reservation.userId._id,
          message: message || `Reservation update for ${roomName || reservation.roomName}`,
          status: status || "info",
          reservationId: reservation._id,
          type: type || "reservation",
          targetRole: "user",
          roomName: roomName || reservation.roomName,
          date: date || reservation.date,
          startTime: startTime || new Date(reservation.datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          endTime: endTime || new Date(reservation.endDatetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
        io
      );
      notifications.push(mainUserNotification);
    }

    // ✅ NOTIFY ALL PARTICIPANTS
    for (const participant of reservation.participants) {
      const participantUser = await User.findOne({ 
        id_number: participant.id_number.toString().trim()
      });

      if (participantUser && (!excludeUserId || participantUser._id.toString() !== excludeUserId)) {
        const participantNotification = await notificationService.createNotification(
          {
            userId: participantUser._id,
            message: message || `You have been added as a participant for ${roomName || reservation.roomName}`,
            status: status || "participant_added",
            reservationId: reservation._id,
            type: type || "reservation",
            targetRole: "user",
            roomName: roomName || reservation.roomName,
            date: date || reservation.date,
            startTime: startTime || new Date(reservation.datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            endTime: endTime || new Date(reservation.endDatetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          },
          io
        );
        notifications.push(participantNotification);
      }
    }

    res.status(201).json({
      message: "Notifications created for all participants",
      notifications: notifications
    });
  } catch (err) {
    console.error("Create participant notifications error:", err);
    res.status(500).json({ message: "Failed to create participant notifications." });
  }
};

// 📌 Get user-specific notifications
exports.getUserNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const { filter } = req.query;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // ✅ FIXED: Show ALL notifications for THIS specific user
    let query = { 
      $or: [
        { userId: userId }, // Notifications specifically for this user
        { 
          targetRole: "user",
          userId: null // General user notifications
        },
        { 
          targetRole: "all",
          userId: null // All users notifications
        }
      ]
    };

    if (filter === "unread") {
      query.isRead = false;
    } else if (filter && filter !== "all") {
      query.type = filter;
    }

    // Also include notifications where user is participant in reservations
    const user = await User.findById(userId);
    if (user && user.id_number) {
      // Find reservations where this user is a participant
      const Reservation = require("../models/Reservation");
      const participantReservations = await Reservation.find({
        "participants.id_number": user.id_number
      });
      
      if (participantReservations.length > 0) {
        const reservationIds = participantReservations.map(r => r._id);
        // Add notifications for these reservations that might be targeted to all users
        query.$or.push({
          reservationId: { $in: reservationIds },
          targetRole: "user"
        });
      }
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .populate("reservationId")
      .populate("reportId")
      .populate("userId", "name email");

    res.status(200).json(notifications);
  } catch (err) {
    console.error("Fetch user notifications error:", err);
    res.status(500).json({ message: "Failed to fetch notifications." });
  }
};

// 📌 Get notifications for a specific reservation (including participants)
exports.getReservationNotifications = async (req, res) => {
  try {
    const { reservationId } = req.params;
    const { userId } = req.query;

    if (!reservationId) {
      return res.status(400).json({ message: "Reservation ID is required" });
    }

    let query = { reservationId };

    // If user ID provided, only show notifications relevant to this user
    if (userId) {
      const user = await User.findById(userId);
      if (user) {
        query.$or = [
          { userId: userId },
          { targetRole: "user", userId: null },
          { targetRole: "all", userId: null }
        ];

        // Check if user is participant in this reservation
        const Reservation = require("../models/Reservation");
        const reservation = await Reservation.findOne({
          _id: reservationId,
          "participants.id_number": user.id_number
        });

        if (reservation) {
          // User is participant, include all user-targeted notifications for this reservation
          query.$or.push({
            reservationId,
            targetRole: "user"
          });
        }
      }
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .populate("reservationId")
      .populate("reportId")
      .populate("userId", "name email");

    res.status(200).json(notifications);
  } catch (err) {
    console.error("Fetch reservation notifications error:", err);
    res.status(500).json({ message: "Failed to fetch reservation notifications." });
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
          },
          {
            targetRole: "all", 
            userId: null
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

    // ✅ FIXED: Count all notifications relevant to this user
    const count = await Notification.countDocuments({
      $or: [
        { userId: userId }, // Notifications specifically for this user
        { 
          targetRole: "user",
          userId: null // General user notifications
        },
        {
          targetRole: "all",
          userId: null
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

// 📌 Get notifications for participants of a specific reservation
exports.getParticipantNotifications = async (req, res) => {
  try {
    const { reservationId } = req.params;

    if (!reservationId) {
      return res.status(400).json({ message: "Reservation ID is required" });
    }

    // Find the reservation and its participants
    const Reservation = require("../models/Reservation");
    const reservation = await Reservation.findById(reservationId);
    
    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    // Get all participant ID numbers
    const participantIdNumbers = reservation.participants.map(p => p.id_number);
    
    // Find users for these participants
    const participantUsers = await User.find({
      id_number: { $in: participantIdNumbers }
    });

    const participantUserIds = participantUsers.map(user => user._id);

    // Find notifications for these participants and the main user
    const notifications = await Notification.find({
      $or: [
        { userId: reservation.userId }, // Main user
        { userId: { $in: participantUserIds } }, // Participants
        { 
          reservationId: reservationId,
          targetRole: "user",
          userId: null
        }
      ]
    })
    .sort({ createdAt: -1 })
    .populate("reservationId")
    .populate("reportId")
    .populate("userId", "name email");

    res.status(200).json(notifications);
  } catch (err) {
    console.error("Fetch participant notifications error:", err);
    res.status(500).json({ message: "Failed to fetch participant notifications." });
  }
};