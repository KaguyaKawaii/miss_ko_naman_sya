const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  reportedBy: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  category: {
    type: String,
    enum: ["Maintenance", "Security", "Equipment", "Other"],
    required: true,
  },
  details: { type: String, required: true },
  floor: { type: String, default: "N/A" },
  room: { type: String, default: "N/A" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Report", reportSchema);