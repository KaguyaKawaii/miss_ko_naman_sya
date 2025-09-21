// services/notificationService.js
const Notification = require("../models/Notification");
const User = require("../models/User");


/**
 * Create a new notification and optionally emit via socket.io
 * @param {Object} data - Notification fields
 * @param {Object} io - Socket.io instance (optional)
 */
// services/notificationService.js
exports.createNotification = async (data, io = null) => {
  const notificationData = {
    userId: data.userId || null,
    reservationId: data.reservationId || null,
    reportId: data.reportId || null,
    message: data.message,
    type: data.type || "system",
    status: data.status || "New",
    isRead: false,
    dismissed: false,
  };

  const notification = await Notification.create(notificationData);

  // 🔔 Emit logic
  if (io) {
    if (data.userId) {
      // Only emit to that specific user (or staff)
      io.to(data.userId.toString()).emit("notification", notification);
    } else if (data.to === "admin") {
      // Explicit admin room
      io.to("admin").emit("notification", notification);
    }
    // ❌ no fallback broadcast
  }

  return notification;
};


exports.createReservationNotification = async (reservation, io) => {
  try {
    const userId = reservation.userId;

    // 1. Notify the user
    await exports.createNotification(
      {
        userId,
        reservationId: reservation._id,
        message: `Your reservation for ${reservation.roomName} has been ${reservation.status}.`,
        type: "reservation",
      },
      io
    );

    // 2. Notify staff on the same floor
    const staff = await User.find({ role: "Staff", floor: reservation.floor });
    for (const s of staff) {
      await exports.createNotification(
        {
          userId: s._id,
          reservationId: reservation._id,
          message: `A reservation on your floor (${reservation.floor}) has been ${reservation.status}.`,
          type: "reservation",
        },
        io
      );
    }

    // 3. Notify admin globally
    await exports.createNotification(
      {
        userId: null, // global
        reservationId: reservation._id,
        message: `A reservation has been ${reservation.status} for room ${reservation.roomName}.`,
        type: "reservation",
      },
      io
    );
  } catch (err) {
    console.error("createReservationNotification error:", err);
  }
};