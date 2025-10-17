const mongoose = require("mongoose");

const RoomSchema = new mongoose.Schema(
  {
    room: { type: String, required: true },
    floor: { type: String, required: true },
    type: { type: String, default: "General" },
    capacity: { type: Number, default: 6 },
    isActive: { type: Boolean, default: true },
    notes: { type: String, default: "" },
    features: {
      wifi: { type: Boolean, default: false },
      aircon: { type: Boolean, default: false },
      projector: { type: Boolean, default: false },
      monitor: { type: Boolean, default: false }
    },
    // Add image field to store the image data
    image: {
      id: { type: String, default: null },
      url: { type: String, default: null },
      name: { type: String, default: "" },
      category: { type: String, default: "" }
    }
  },
  { timestamps: true }
);

RoomSchema.index({ floor: 1, room: 1 }, { unique: true });

module.exports = mongoose.models.Room || mongoose.model("Room", RoomSchema);