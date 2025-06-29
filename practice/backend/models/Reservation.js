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
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    datetime: { type: Date, required: true },
    endDatetime: { type: Date, required: true },
    date: { type: String, required: true },
    numUsers: { type: Number, required: true },
    purpose: { type: String, required: true },
    location: { type: String, required: true },
    roomName: { type: String, required: true },
    participants: [participantSchema],
    status: { type: String, default: "Pending" }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.models.Reservation || mongoose.model("Reservation", reservationSchema);
