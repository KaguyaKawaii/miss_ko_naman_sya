const Room = require("../models/Room");
const Reservation = require("../models/Reservation");

exports.generateAvailability = async (date, userId) => {
  console.log("🔄 [DEBUG] generateAvailability called with:", { date, userId });
  
  try {
    // ✅ Get ALL rooms (including inactive ones)
    const rooms = await Room.find({}).sort({ floor: 1, room: 1 });
    
    console.log("🏢 [DEBUG] Total rooms from database:", rooms.length);
    console.log("🚫 [DEBUG] Inactive rooms count:", rooms.filter(room => !room.isActive).length);
    console.log("✅ [DEBUG] Active rooms count:", rooms.filter(room => room.isActive).length);
    
    // Log all rooms with their isActive status
    rooms.forEach(room => {
      console.log(`   - ${room.room} (Floor: ${room.floor}, Active: ${room.isActive})`);
    });

    // ✅ Fetch reservations for this date that are still relevant
    const reservations = await Reservation.find({
      date,
      status: { $in: ["Pending", "Approved"] },
    });

    console.log("📅 [DEBUG] Reservations found:", reservations.length);

    // ✅ Build availability for each room
    const result = rooms.map((room) => {
      // For inactive rooms, don't check reservations - they're always unavailable
      if (!room.isActive) {
        return {
          floor: room.floor,
          room: room.room,
          isActive: false,
          occupied: [],
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

    console.log("📤 [DEBUG] Final result being sent - Total rooms:", result.length);
    console.log("📤 [DEBUG] Inactive rooms in result:", result.filter(room => !room.isActive).length);
    console.log("📤 [DEBUG] Active rooms in result:", result.filter(room => room.isActive).length);

    return result;
  } catch (error) {
    console.error("❌ [DEBUG] Error in generateAvailability:", error);
    throw error;
  }
};