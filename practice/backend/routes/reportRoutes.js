const express = require("express");
const router = express.Router();
const Report = require("../models/Report");
const ArchivedReport = require("../models/ArchivedReport");
const Notification = require("../models/Notification");

/* ------------------------------------------------
   ✅ Get all active reports
------------------------------------------------ */
router.get("/", async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 });
    res.status(200).json(reports);
  } catch (err) {
    console.error("❌ Error fetching reports:", err);
    res.status(500).json({ message: "Failed to fetch reports", error: err.message });
  }
});




/* ------------------------------------------------
   ✅ Get archived reports (from ArchivedReport collection)
------------------------------------------------ */
router.get("/archived", async (req, res) => {
  try {
    const archived = await ArchivedReport.find()
      .populate("userId")
      .sort({ archivedAt: -1 });
    res.json(archived);
  } catch (err) {
    console.error("❌ Error fetching archived reports:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ------------------------------------------------
   ✅ Create Report + notify admin
------------------------------------------------ */
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
    const notification = new Notification({
      userId: null,
      reportId: newReport._id,
      message: `${reportedBy} submitted a ${category} report for ${floor} - ${room}`,
      status: "New",
      type: "report",
    });
    await notification.save();

    // Emit via Socket.io
    if (req.app.get("io")) {
      req.app.get("io").emit("notification", notification);
    }

    res.status(201).json(newReport);
  } catch (err) {
    console.error("❌ Error creating report:", err);
    res.status(500).json({ message: "Failed to submit report", error: err.message });
  }
});

/* ------------------------------------------------
   ✅ Archive a report (move to ArchivedReport collection)
------------------------------------------------ */
router.put("/archive/:id", async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ error: "Report not found" });

    const archived = new ArchivedReport({
      originalReportId: report._id,
      reportedBy: report.reportedBy,
      userId: report.userId,
      category: report.category,
      details: report.details,
      floor: report.floor,
      room: report.room,
    });
    await archived.save();

    await report.deleteOne();

    res.json({
      success: true,
      message: "Report archived successfully",
      archivedReport: archived,
    });
  } catch (err) {
    console.error("❌ Error archiving report:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/* ------------------------------------------------
   ✅ Restore an archived report
------------------------------------------------ */
router.put("/restore/:id", async (req, res) => {
  try {
    const archived = await ArchivedReport.findById(req.params.id);
    if (!archived) return res.status(404).json({ error: "Archived report not found" });

    // Copy back to Report collection
    const restored = new Report({
      reportedBy: archived.reportedBy,
      userId: archived.userId,
      category: archived.category,
      details: archived.details,
      floor: archived.floor,
      room: archived.room,
    });
    await restored.save();

    // Delete from archive
    await archived.deleteOne();

    res.json({ message: "Report restored", restored });
  } catch (err) {
    console.error("❌ Error restoring report:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ------------------------------------------------
   ✅ Permanently delete an archived report
------------------------------------------------ */
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await ArchivedReport.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Archived report not found" });
    res.sendStatus(204);
  } catch (err) {
    console.error("❌ Error deleting archived report:", err);
    res.status(500).json({ message: "Failed to delete archived report", error: err.message });
  }
});

/* ------------------------------------------------
   ✅ Get single active report by ID
------------------------------------------------ */
router.get("/:id", async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: "Report not found" });
    res.status(200).json(report);
  } catch (err) {
    console.error("❌ Error fetching report by ID:", err);
    res.status(500).json({ message: "Failed to fetch report", error: err.message });
  }
});

module.exports = router;
