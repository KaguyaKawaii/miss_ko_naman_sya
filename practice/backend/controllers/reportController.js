const Report = require("../models/Report");
const ArchivedReport = require("../models/ArchivedReport");
const Notification = require("../models/Notification");

/* ------------------------------------------------
   ✅ Get all active reports
------------------------------------------------ */
exports.getReports = async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 });
    res.status(200).json(reports);
  } catch (err) {
    console.error("❌ Error fetching reports:", err);
    res.status(500).json({
      message: "Failed to fetch reports",
      error: err.message,
    });
  }
};

/* ------------------------------------------------
   ✅ Get report by ID
------------------------------------------------ */
exports.getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id).populate(
      "userId",
      "name email"
    );
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }
    res.status(200).json(report);
  } catch (err) {
    console.error("❌ Error fetching report by ID:", err);
    res.status(500).json({
      message: "Failed to fetch report",
      error: err.message,
    });
  }
};

/* ------------------------------------------------
   ✅ Get archived reports
------------------------------------------------ */
exports.getArchivedReports = async (req, res) => {
  try {
    const archived = await ArchivedReport.find()
      .populate("userId")
      .sort({ archivedAt: -1 });
    res.status(200).json(archived);
  } catch (err) {
    console.error("❌ Error fetching archived reports:", err);
    res.status(500).json({ error: err.message });
  }
};

/* ------------------------------------------------
   ✅ Create Report + Notify Admin
------------------------------------------------ */
exports.createReport = async (req, res) => {
  try {
    let { reportedBy, userId, category, details, floor, room } = req.body;

    // ✅ Clean & validate input
    reportedBy = reportedBy?.trim();
    category = category?.trim();
    details = details?.trim();
    floor = floor?.trim();
    room = room?.trim();

    if (!reportedBy || !userId || !category || !details || !floor || !room) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // 1️⃣ Create report
    const newReport = await Report.create({
      reportedBy,
      userId,
      category,
      details,
      floor,
      room,
    });

    // 2️⃣ Create notification (admins will see this)
    let notification = await Notification.create({
      userId: null, // global notification
      reportId: newReport._id,
      message: `${reportedBy} submitted a ${category} report for ${floor} - ${room}`,
      type: "report",
      status: "New",
      isRead: false,
      dismissed: false,
    });

    // 3️⃣ Populate report data for real-time emission
    notification = await notification.populate("reportId", "category floor room");

    // 4️⃣ Emit via socket.io if available
    const io = req.app.get("io");
    if (io) {
      io.emit("notification", notification);
    }

    res.status(201).json({
      message: "Report submitted successfully",
      report: newReport,
      notification,
    });
  } catch (err) {
    console.error("❌ Error creating report:", err);
    res.status(500).json({
      message: "Failed to submit report",
      error: err.message,
    });
  }
};

/* ------------------------------------------------
   ✅ Archive Report
------------------------------------------------ */
exports.archiveReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ error: "Report not found" });

    const archived = await ArchivedReport.create({
      originalReportId: report._id,
      reportedBy: report.reportedBy,
      userId: report.userId,
      category: report.category,
      details: report.details,
      floor: report.floor || "N/A",
      room: report.room || "N/A",
    });

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
};

/* ------------------------------------------------
   ✅ Restore Report
------------------------------------------------ */
exports.restoreReport = async (req, res) => {
  try {
    const archived = await ArchivedReport.findById(req.params.id);
    if (!archived)
      return res.status(404).json({ error: "Archived report not found" });

    const restored = await Report.create({
      reportedBy: archived.reportedBy,
      userId: archived.userId,
      category: archived.category,
      details: archived.details,
      floor: archived.floor,
      room: archived.room,
    });

    await archived.deleteOne();

    res.json({
      message: "Report restored",
      restored,
    });
  } catch (err) {
    console.error("❌ Error restoring report:", err);
    res.status(500).json({ error: err.message });
  }
};

/* ------------------------------------------------
   ✅ Delete Archived Report
------------------------------------------------ */
exports.deleteArchivedReport = async (req, res) => {
  try {
    const deleted = await ArchivedReport.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ message: "Archived report not found" });

    res.sendStatus(204);
  } catch (err) {
    console.error("❌ Error deleting archived report:", err);
    res.status(500).json({
      message: "Failed to delete archived report",
      error: err.message,
    });
  }
};
