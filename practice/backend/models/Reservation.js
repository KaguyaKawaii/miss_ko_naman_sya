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

    // Optional legacy fields (can be removed later)
    location: { type: String },       // for display only
    roomName: { type: String },       // for display only

    participants: [participantSchema],

    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Cancelled"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Reservation ||
  mongoose.model("Reservation", reservationSchema);
