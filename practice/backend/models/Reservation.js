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
    datetime: { type: Date, required: true }, // Start time
    endDatetime: { type: Date, required: true }, // End time
    date: { type: String, required: true },
    numUsers: { type: Number, required: true },
    purpose: { type: String, required: true },
    location: { type: String },
    roomName: { type: String },
    participants: [participantSchema],

    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Cancelled", "Expired", "Ongoing"],
      default: "Pending",
    },

    archived: {
      type: Boolean,
      default: false,
    },

    notificationSent: {
      type: Boolean,
      default: false,
    },
    lastNotificationType: {
      type: String,
      enum: ["15-min-reminder", "expiry", "no-show", null],
      default: null,
    },

    checkedIn: {
      type: Boolean,
      default: false,
    },
    actualStartTime: Date,
    actualEndTime: Date,

    extensionRequested: {
      type: Boolean,
      default: false,
    },
    extensionHours: {
      type: Number,
      enum: [1, 2, null],
      default: null,
    },
    extensionStatus: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", null],
      default: null,
    },
    extendedEndDatetime: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// ✅ Indexes for faster queries
reservationSchema.index({ datetime: 1 });
reservationSchema.index({ status: 1 });
reservationSchema.index({ userId: 1 });
reservationSchema.index({ archived: 1 });

module.exports =
  mongoose.models.Reservation ||
  mongoose.model("Reservation", reservationSchema);
