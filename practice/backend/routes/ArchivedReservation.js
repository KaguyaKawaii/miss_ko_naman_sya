const mongoose = require("mongoose");
const Reservation = require("./Reservation");

// Clone Reservation schema definition
const archivedReservationSchema = new mongoose.Schema(
  {
    ...Reservation.schema.obj, // copies all fields from Reservation
    archivedAt: { type: Date, default: Date.now }, // add archive timestamp
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.ArchivedReservation ||
  mongoose.model("ArchivedReservation", archivedReservationSchema);
