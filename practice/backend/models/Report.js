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

  // ✅ Staff assignment
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

  // ✅ Workflow status
  status: {
    type: String,
    enum: ["Pending", "In Progress", "Resolved", "Archived"],
    default: "Pending",
  },
  actionTaken: { type: String, default: "" },
  resolvedAt: { type: Date },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Automatically update `updatedAt` whenever a document is modified
reportSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Report", reportSchema);
