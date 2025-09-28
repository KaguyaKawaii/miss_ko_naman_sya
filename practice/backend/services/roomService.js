const Room = require("../models/Room");
const logAction = require("../utils/logAction");

exports.getAllRooms = async () => {
  return await Room.find().sort({ floor: 1, room: 1 });
};

exports.getRoomById = async (roomId) => {
  return await Room.findById(roomId);
};

exports.createRoom = async (data, req) => {
  const room = await Room.create(data);

  logAction({
    req,
    userId: req.adminId,
    role: "Admin",
    action: "Created Room",
    details: `Room: ${room.room}, Floor: ${room.floor}, Type: ${room.type}, Capacity: ${room.capacity}`,
  });

  return room;
};

exports.updateRoom = async (roomId, data, req) => {
  const oldRoom = await Room.findById(roomId);
  const room = await Room.findByIdAndUpdate(roomId, data, { new: true, runValidators: true });

  // Log changes
  const changes = [];
  if (oldRoom.room !== room.room) changes.push(`name: ${oldRoom.room} → ${room.room}`);
  if (oldRoom.floor !== room.floor) changes.push(`floor: ${oldRoom.floor} → ${room.floor}`);
  if (oldRoom.type !== room.type) changes.push(`type: ${oldRoom.type} → ${room.type}`);
  if (oldRoom.capacity !== room.capacity) changes.push(`capacity: ${oldRoom.capacity} → ${room.capacity}`);
  if (oldRoom.isActive !== room.isActive) changes.push(`status: ${oldRoom.isActive ? 'Active' : 'Inactive'} → ${room.isActive ? 'Active' : 'Inactive'}`);
  if (oldRoom.notes !== room.notes) changes.push(`notes updated`);
  
  // Check feature changes
  const featureChanges = [];
  Object.keys(room.features || {}).forEach(feature => {
    const oldValue = oldRoom.features?.[feature] || false;
    const newValue = room.features?.[feature] || false;
    if (oldValue !== newValue) {
      featureChanges.push(`${feature}: ${oldValue ? 'Yes' : 'No'} → ${newValue ? 'Yes' : 'No'}`);
    }
  });

  if (featureChanges.length > 0) {
    changes.push(`features: ${featureChanges.join(', ')}`);
  }

  logAction({
    req,
    userId: req.adminId,
    role: "Admin",
    action: "Updated Room",
    details: `Room: ${room.room} (${room._id}) - Changes: ${changes.join('; ')}`,
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
    details: `Room ID: ${room._id}, Name: ${room.room}, Floor: ${room.floor}`,
  });

  return room;
};

exports.toggleRoomStatus = async (roomId, req) => {
  const room = await Room.findById(roomId);
  const updatedRoom = await Room.findByIdAndUpdate(
    roomId, 
    { isActive: !room.isActive }, 
    { new: true }
  );

  logAction({
    req,
    userId: req.adminId,
    role: "Admin",
    action: updatedRoom.isActive ? "Activated Room" : "Deactivated Room",
    details: `Room: ${updatedRoom.room}, Floor: ${updatedRoom.floor}, New Status: ${updatedRoom.isActive ? 'Active' : 'Inactive'}`,
  });

  return updatedRoom;
};

exports.getRoomsByFloor = async (floor) => {
  return await Room.find({ floor, isActive: true }).sort({ room: 1 });
};

exports.getRoomsByType = async (type) => {
  return await Room.find({ type, isActive: true }).sort({ floor: 1, room: 1 });
};

exports.getAvailableRooms = async () => {
  return await Room.find({ isActive: true }).sort({ floor: 1, room: 1 });
};

exports.getRoomStats = async () => {
  const stats = await Room.aggregate([
    {
      $group: {
        _id: null,
        totalRooms: { $sum: 1 },
        activeRooms: { $sum: { $cond: ["$isActive", 1, 0] } },
        inactiveRooms: { $sum: { $cond: ["$isActive", 0, 1] } },
        totalCapacity: { $sum: "$capacity" },
        avgCapacity: { $avg: "$capacity" }
      }
    }
  ]);

  const floors = await Room.distinct("floor");
  const types = await Room.aggregate([
    {
      $group: {
        _id: "$type",
        count: { $sum: 1 }
      }
    }
  ]);

  return {
    ...stats[0],
    floors: floors.length,
    roomTypes: types
  };
};