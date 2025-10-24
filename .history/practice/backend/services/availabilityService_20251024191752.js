const Room = require("../models/Room");
const Reservation = require("../models/Reservation");

exports.generateAvailability = async (date, userId) => {
  // ✅ Get ALL rooms (including inactive ones)
  const rooms = await Room.find({}).sort({ floor: 1, room: 1 });

  // ✅ Fetch reservations for this date that are still relevant
  const reservations = await Reservation.find({
    date,
    status: { $in: ["Pending", "Approved"] },
  });

  // ✅ Build availability for each room - INCLUDE ALL ROOMS
  return rooms.map((room) => {
    // For inactive rooms, don't check reservations - they're always unavailable
    if (!room.isActive) {
      return {
        floor: room.floor,
        room: room.room,
        isActive: false,
        occupied: [], // No occupied times for inactive rooms
      };
    }

    // For active rooms, check their reservation status
    const roomReservations = reservations.filter(
      (r) => r.location === room.floor && r.roomName === room.room
    );

    const occupied = roomReservations.map((r) => ({
      start: r.datetime,
      end: r.endDatetime,
      mine: r.userId.toString() === userId,
      status: r.status,
    }));

    return {
      floor: room.floor,
      room: room.room,
      isActive: true,
      occupied,
    };
  });
};