const mongoose = require("mongoose");

const participantSchema = new mongoose.Schema({
  name: String,
  course: String,
  year_level: String,
  department: String,
  idNumber: String,
});

const reservationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    room_Id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },
    datetime: { type: Date, required: true },
    endDatetime: { type: Date, required: true },
    date: { type: String, required: true },
    numUsers: { type: Number, required: true },
    purpose: { type: String, required: true },
    location: { type: String },       // for display only
    roomName: { type: String },       // for display only
    participants: [participantSchema],
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Cancelled", "Expired", "Ongoing"],
      default: "Pending",
    },
    // New fields for notification tracking
    notificationSent: {
      type: Boolean,
      default: false
    },
    lastNotificationType: {
      type: String,
      enum: ["15-min-reminder", "expiry", "no-show", null],
      default: null
    },
    // Track if someone has checked in
    checkedIn: {
      type: Boolean,
      default: false
    },
    // Track actual usage times
    actualStartTime: Date,
    actualEndTime: Date
  },
  { timestamps: true }
);

// Add index for faster queries on datetime and status
reservationSchema.index({ datetime: 1 });
reservationSchema.index({ status: 1 });
reservationSchema.index({ userId: 1 });

module.exports =
  mongoose.models.Reservation ||
  mongoose.model("Reservation", reservationSchema);