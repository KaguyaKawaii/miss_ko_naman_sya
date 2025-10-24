const Room = require("../models/Room");
const Reservation = require("../models/Reservation");

exports.generateAvailability = async (date, userId) => {
  // ✅ Get all rooms (including inactive ones), sorted by floor then room name
  const rooms = await Room.find({}).sort({ floor: 1, room: 1 });

  // ✅ Fetch reservations for this date that are still relevant
  const reservations = await Reservation.find({
    date,
    status: { $in: ["Pending", "Approved"] }, // only show blocking reservations
  });

  // ✅ Build availability for each room
  return rooms.map((room) => {
    // Filter reservations for this room
    const roomReservations = reservations.filter(
      (r) => r.location === room.floor && r.roomName === room.room
    );

    // Build occupied array (include start/end time, owner, and status)
    const occupied = roomReservations.map((r) => ({
      start: r.datetime, // exact start datetime
      end: r.endDatetime, // exact end datetime
      mine: r.userId.toString() === userId,
      status: r.status,
    }));

    return {
      floor: room.floor,
      room: room.room,
      isActive: room.isActive, // ✅ Add this line - crucial!
      occupied,
    };
  });
};