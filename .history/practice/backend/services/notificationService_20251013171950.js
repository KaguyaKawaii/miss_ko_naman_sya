const Notification = require("../models/Notification");

class NotificationService {
  async createNotification(notificationData, io) {
    try {
      const {
        userId,
        message,
        status,
        reservationId,
        type = "reservation",
        reportId,
        targetRole = "user",
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
      } = notificationData;

      // Normalize status to proper casing
      const normalizedStatus = this.normalizeStatus(status || "Pending");

      // Generate message if not provided
      const finalMessage = message || this.generateDefaultMessage({
        status: normalizedStatus,
        roomName,
        date,
        type
      });

      // Create the notification
      const notification = new Notification({
        userId,
        message: finalMessage,
        status: normalizedStatus,
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
        staffName,
        isRead: false,
        dismissed: false,
      });

      await notification.save();

      // Populate the notification for emitting
      const populatedNotification = await Notification.findById(notification._id)
        .populate("reservationId")
        .populate("reportId")
        .populate("userId", "name email");

      // ✅ FIXED: Emit the notification with correct event names and rooms
      if (io) {
        const emitData = populatedNotification;
        
        console.log(`🔔 Emitting notification for:`, {
          userId,
          targetRole,
          message: populatedNotification.message
        });

        if (targetRole === "admin") {
          io.to("admin-room").emit("new-notification", emitData);
          io.to("admin-room").emit("notification", emitData);
          console.log('📢 Sent to admin-room');
        } else if (userId) {
          // ✅ FIXED: Use the same room name as backend socket setup: "user-{userId}"
          io.to(`user-${userId}`).emit("new-notification", emitData);
          io.to(`user-${userId}`).emit("notification", emitData);
          console.log(`📢 Sent to user-${userId} room`);
        } else {
          io.emit("new-notification", emitData);
          io.emit("notification", emitData);
          console.log('📢 Broadcast to all users');
        }
      }

      return populatedNotification;
    } catch (error) {
      console.error("Notification service error:", error);
      throw error;
    }
  }

  // Create multiple notifications for different users
  async createBulkNotifications(notificationsData, io) {
    try {
      // Normalize data for bulk insert
      const normalizedNotifications = notificationsData.map(notification => ({
        ...notification,
        status: this.normalizeStatus(notification.status || "Pending"),
        message: notification.message || this.generateDefaultMessage({
          status: this.normalizeStatus(notification.status || "Pending"),
          roomName: notification.roomName,
          date: notification.date,
          type: notification.type
        }),
        isRead: false,
        dismissed: false,
      }));

      const notifications = await Notification.insertMany(normalizedNotifications);
      
      // ✅ FIXED: Emit each notification with correct event names
      if (io) {
        for (const notification of notifications) {
          const populated = await Notification.findById(notification._id)
            .populate("reservationId")
            .populate("reportId")
            .populate("userId", "name email");
          
          const emitData = populated;
          
          if (notification.targetRole === "admin") {
            io.to("admin-room").emit("new-notification", emitData);
            io.to("admin-room").emit("notification", emitData);
          } else if (notification.targetRole === "staff") {
            io.emit("new-notification", emitData);
            io.emit("staff_notification", emitData);
          } else if (notification.userId) {
            // ✅ FIXED: Use the same room name as backend socket setup
            io.to(`user-${notification.userId.toString()}`).emit("new-notification", emitData);
            io.to(`user-${notification.userId.toString()}`).emit("notification", emitData);
          } else {
            io.emit("new-notification", emitData);
            io.emit("notification", emitData);
          }
        }
      }

      return notifications;
    } catch (error) {
      console.error("Bulk notification service error:", error);
      throw error;
    }
  }

  // Helper method to normalize status casing
  normalizeStatus(status) {
    if (!status || typeof status !== 'string') return 'Pending';
    
    const statusMap = {
      'pending': 'Pending',
      'approved': 'Approved', 
      'rejected': 'Rejected',
      'cancelled': 'Cancelled',
      'ongoing': 'Ongoing',
      'expired': 'Expired',
      'completed': 'Completed',
      'system': 'System',
      'new': 'New',
      'verified': 'Verified',
      'unverified': 'Unverified'
    };
    
    return statusMap[status.toLowerCase()] || 'Pending';
  }

  // Helper method to generate default message
  generateDefaultMessage(data) {
    const { status, roomName, date, type } = data;

    if (type === "reservation") {
      switch (status) {
        case "Approved":
          return `Your reservation for ${roomName || 'the room'} on ${date || 'the selected date'} has been approved.`;
        case "Rejected":
          return `Your reservation for ${roomName || 'the room'} on ${date || 'the selected date'} has been rejected.`;
        case "Pending":
          return `Your reservation for ${roomName || 'the room'} on ${date || 'the selected date'} is pending approval.`;
        case "Cancelled":
          return `Your reservation for ${roomName || 'the room'} on ${date || 'the selected date'} has been cancelled.`;
        case "Ongoing":
          return `Your reservation for ${roomName || 'the room'} is now ongoing.`;
        case "Expired":
          return `Your reservation for ${roomName || 'the room'} on ${date || 'the selected date'} has expired.`;
        case "New":
          return `New reservation request for ${roomName || 'the room'} on ${date || 'the selected date'}.`;
        default:
          return `Update regarding your reservation for ${roomName || 'the room'}.`;
      }
    } else if (type === "report") {
      return `New report notification.`;
    } else if (type === "system") {
      return `System notification.`;
    } else if (type === "announcement") {
      return `New announcement.`;
    } else if (type === "reminder") {
      return `Reminder notification.`;
    } else if (type === "extension") {
      return `Extension request notification.`;
    } else if (type === "maintenance") {
      return `Maintenance notification.`;
    }

    return "New notification";
  }
}

module.exports = new NotificationService();