const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
      index: true,
    },
    reservationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reservation",
      default: null,
    },
    reportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Report",
      default: null,
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
        "New", // ✅ "New" is enough to indicate a fresh notification
      ],
      default: "New",
    },
    type: {
      type: String,
      enum: ["reservation", "report", "system", "alert", "user"],
      default: "system",
    },
    isRead: {
      type: Boolean,
      default: false, // ✅ this is what we use to track unread/read
      index: true,
    },
    dismissed: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Useful index for fetching unread notifications fast
notificationSchema.index({ userId: 1, isRead: 1 });

module.exports =
  mongoose.models.Notification ||
  mongoose.model("Notification", notificationSchema);
