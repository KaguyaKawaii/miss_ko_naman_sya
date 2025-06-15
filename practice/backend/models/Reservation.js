const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
  name: String,
  courseYear: String,
  department: String,
  idNumber: String,
});

const reservationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  datetime: { type: Date, required: true },
  numUsers: { type: Number, required: true },
  purpose: { type: String, required: true },
  location: { type: String, required: true },
  roomName: { type: String, required: true },
  participants: [participantSchema],
});

module.exports = mongoose.model('Reservation', reservationSchema);