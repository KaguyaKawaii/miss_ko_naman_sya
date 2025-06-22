const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // optimize queries by user
    },
    reservationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reservation",
      default: null, // allow null for general notifications
    },
    message: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 500,
    },
    status: {
      type: String,
      enum: [
        "Pending",
        "Approved",
        "Rejected",
        "Cancelled",
        "Ongoing",
        "Expired",
        "Info",
      ],
      default: "Info",
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true, // optimize unread queries
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt fields
  }
);

// Optional compound index for faster bulk unread queries per user
notificationSchema.index({ userId: 1, isRead: 1 });

module.exports =
  mongoose.models.Notification ||
  mongoose.model("Notification", notificationSchema);
