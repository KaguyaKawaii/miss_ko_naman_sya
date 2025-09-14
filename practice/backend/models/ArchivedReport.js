const mongoose = require("mongoose");

const archivedReportSchema = new mongoose.Schema(
  {
    originalReportId: { type: mongoose.Schema.Types.ObjectId, ref: "Report" }, // reference original
    reportedBy: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    category: { type: String, required: true },
    details: { type: String, required: true },
    floor: { type: String, required: true },
    room: { type: String, required: true },
    archivedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ArchivedReport", archivedReportSchema);
