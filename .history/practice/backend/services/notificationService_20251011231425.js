
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

      // Create the notification
      const notification = new Notification({
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
      const notifications = await Notification.insertMany(notificationsData);
      
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
}

module.exports = new NotificationService();
