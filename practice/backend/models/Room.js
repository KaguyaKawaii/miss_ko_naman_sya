const mongoose = require("mongoose");

const RoomSchema = new mongoose.Schema(
  {
    room: { type: String, required: true },       // e.g., "Room 101"
    floor: { type: String, required: true },      // e.g., "Ground Floor"
    type: { type: String, default: "General" },   // e.g., "Lab", "Conference", etc.
    capacity: { type: Number, default: 6 },       // max number of users
    isActive: { type: Boolean, default: true },   // can be used for soft disable
  },
  { timestamps: true }
);

// Ensure each room name is unique per floor
RoomSchema.index({ floor: 1, room: 1 }, { unique: true });

module.exports = mongoose.models.Room || mongoose.model("Room", RoomSchema);
