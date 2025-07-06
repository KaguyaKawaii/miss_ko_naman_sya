const express = require("express");
const router = express.Router();
const Report = require("../models/Report");
const Notification = require("../models/Notification");

// ✅ Get a single report by ID
router.get("/:id", async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }
    res.status(200).json(report);
  } catch (err) {
    console.error("Error fetching report by ID:", err);
    res.status(500).json({ message: "Failed to fetch report", error: err.message });
  }
});

// ✅ Create Report + notify admin
router.post("/", async (req, res) => {
  try {
    const { reportedBy, userId, category, details, floor, room } = req.body;

    if (!reportedBy || !userId || !category || !details || !floor || !room) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Save Report
    const newReport = new Report({
      reportedBy,
      userId,
      category,
      details,
      floor,
      room,
    });
    await newReport.save();

    // Create Notification
    // ✅ Create Notification with reportId
const notification = new Notification({
  userId: null,
  reportId: newReport._id, // ✅ Link the created report
  message: `${reportedBy} submitted a ${category} report for ${floor} - ${room}`,
  status: "New",
  type: "report",
});
    await notification.save();

    // Emit via Socket.io
    if (req.app.get("io")) {
      const io = req.app.get("io");
      io.emit("notification", notification);
    }

    res.status(201).json(newReport);
  } catch (err) {
    console.error("❌ Error creating report:", err);
    res.status(500).json({ message: "Failed to submit report", error: err.message });
  }
});

// ✅ Get all reports
router.get("/", async (req, res) => {
  try {
    const reports = await Report.find().sort({ created_at: -1 });
    res.status(200).json(reports);
  } catch (err) {
    console.error("❌ Error fetching reports:", err);
    res.status(500).json({ message: "Failed to fetch reports", error: err.message });
  }
});

// ✅ Delete report
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Report.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Report not found" });
    res.sendStatus(204);
  } catch (err) {
    console.error("❌ Error deleting report:", err);
    res.status(500).json({ message: "Failed to delete report", error: err.message });
  }
});

module.exports = router;
