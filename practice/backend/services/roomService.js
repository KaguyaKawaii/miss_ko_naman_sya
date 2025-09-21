const Room = require("../models/Room");
const logAction = require("../utils/logAction");

exports.getAllRooms = async () => {
  return await Room.find({ isActive: true }).sort({ floor: 1, room: 1 });
};

exports.createRoom = async (data, req) => {
  const room = await Room.create(data);

  logAction({
    req,
    userId: req.adminId,
    role: "Admin",
    action: "Created Room",
    details: `Room: ${room.room}, Floor: ${room.floor}`,
  });

  return room;
};

exports.deleteRoom = async (roomId, req) => {
  const room = await Room.findByIdAndDelete(roomId);

  logAction({
    req,
    userId: req.adminId,
    role: "Admin",
    action: "Deleted Room",
    details: `Room ID: ${room._id}, Name: ${room.room}`,
  });

  return room;
};
