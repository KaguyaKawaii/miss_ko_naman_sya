const Report = require("../models/Report");
const ArchivedReport = require("../models/ArchivedReport");
const Notification = require("../models/Notification");
const User = require("../models/User");
const logAction = require("../utils/logAction");

/* ------------------------------------------------
   ✅ Get all active reports
------------------------------------------------ */
exports.getReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate("assignedTo", "name email floor")
      .populate("assignedBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ message: "Error fetching reports", error });
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
   ✅ Create Report + Auto-Assign Staff + Notify Admin
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

    // 1️⃣ Find staff for the given floor
    const staffList = await User.find({ role: "Staff", floor });
    let assignedTo = null;

    if (staffList.length > 0) {
      // Get staff with least assigned reports
      let minReports = Infinity;
      for (const staff of staffList) {
        const count = await Report.countDocuments({ assignedTo: staff._id, status: { $ne: "Resolved" } });
        if (count < minReports) {
          minReports = count;
          assignedTo = staff._id;
        }
      }
    }

    // 2️⃣ Create report (auto-assign staff if available)
    const newReport = await Report.create({
      reportedBy,
      userId,
      category,
      details,
      floor,
      room,
      status: "Pending",
      assignedTo: assignedTo || null,
    });

    // 3️⃣ Log report creation
    await logAction(
      userId,
      "Report Creator",
      reportedBy,
      "Report Created",
      `${reportedBy} created a ${category} report for ${floor} - ${room}`
    );

    // 4️⃣ Create notification (admins will see this)
    let notification = await Notification.create({
      userId: null,
      reportId: newReport._id,
      message: `${reportedBy} submitted a ${category} report for ${floor} - ${room}`,
      type: "report", // ✅ Fixed: using valid enum value
      status: "New",
      isRead: false,
      dismissed: false,
    });

    // 5️⃣ Notify assigned staff (if any)
    if (assignedTo) {
      const assignedStaff = await User.findById(assignedTo);
      await Notification.create({
        userId: assignedTo,
        reportId: newReport._id,
        message: `A new ${category} report has been assigned to you (${floor} - ${room}).`,
        type: "report", // ✅ Fixed: using valid enum value
        status: "New",
        isRead: false,
        dismissed: false,
      });
    }

    // 6️⃣ Emit via socket.io if available
    notification = await notification.populate("reportId", "category floor room");
    const io = req.app.get("io");
    if (io) {
      io.emit("notification", notification);
    }

    res.status(201).json({
      message: assignedTo
        ? "Report submitted and auto-assigned successfully"
        : "Report submitted (no staff available for auto-assignment)",
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
   ✅ Resolve Report
------------------------------------------------ */
exports.resolveReport = async (req, res) => {
  try {
    const { actionTaken, resolvedBy } = req.body;

    if (!actionTaken || actionTaken.trim() === "") {
      return res.status(400).json({ message: "Action taken is required" });
    }

    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    // Handle case where resolvedBy might not be provided
    let resolverName = "Admin";
    let resolverId = resolvedBy || "system";
    
    if (resolvedBy) {
      const resolver = await User.findById(resolvedBy);
      resolverName = resolver ? resolver.name : "Admin";
    }

    // ✅ Update report status and action taken
    report.status = "Resolved";
    report.actionTaken = actionTaken.trim();
    report.resolvedAt = new Date();
    report.updatedAt = new Date();

    await report.save();

    // ✅ Log resolution
    await logAction(
      resolverId,
      "N/A", // id_number if not available
      resolverName,
      "Report Resolved",
      `Report ${report._id} resolved by ${resolverName}. Action: ${actionTaken}`
    );

    // ✅ Notify user about resolution
    await Notification.create({
      userId: report.userId,
      reportId: report._id,
      message: `Your report for ${report.floor} - ${report.room} has been resolved.`,
      type: "report", // ✅ Fixed: using valid enum value
      status: "Resolved",
      isRead: false,
      dismissed: false,
    });

    res.status(200).json({
      message: "Report resolved successfully",
      report,
    });
  } catch (err) {
    console.error("❌ Error resolving report:", err);
    res.status(500).json({
      message: "Failed to resolve report",
      error: err.message,
    });
  }
};

/* ------------------------------------------------
   ✅ Admin Updates Report Status / Action Taken
------------------------------------------------ */
exports.updateReportStatus = async (req, res) => {
  try {
    const { status, updatedBy } = req.body;
    const allowedStatuses = ["Pending", "In Progress", "Resolved", "Archived"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ error: "Report not found" });

    const previousStatus = report.status;
    report.status = status;
    report.updatedAt = new Date();
    
    const updatedReport = await report.save();

    // Get updater info for logging
    const updater = await User.findById(updatedBy);
    const updaterName = updater ? updater.name : "Admin";

    // ✅ Log status update
    await logAction(
      updatedBy,
      updater?.id_number || "N/A",
      updaterName,
      "Report Status Updated",
      `Report ${report._id} status changed from ${previousStatus} to ${status} by ${updaterName}`
    );

    res.json(updatedReport);
  } catch (err) {
    console.error("Failed to update report status:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/* ------------------------------------------------
   ✅ Archive Report (Update status to Archived instead of deleting)
------------------------------------------------ */
exports.archiveReport = async (req, res) => {
  try {
    const { archivedBy } = req.body;
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ error: "Report not found" });

    // Get archiver info for logging
    const archiver = await User.findById(archivedBy);
    const archiverName = archiver ? archiver.name : "Admin";

    // ✅ Update status to Archived instead of moving to archive collection
    report.status = "Archived";
    report.updatedAt = new Date();
    await report.save();

    // ✅ Log archiving
    await logAction(
      archivedBy,
      archiver?.id_number || "N/A",
      archiverName,
      "Report Archived",
      `Report ${report._id} archived by ${archiverName}`
    );

    res.json({
      success: true,
      message: "Report archived successfully",
      report,
    });
  } catch (err) {
    console.error("❌ Error archiving report:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/* ------------------------------------------------
   ✅ Restore Report (from Archived status)
------------------------------------------------ */
exports.restoreReport = async (req, res) => {
  try {
    const { restoredBy } = req.body;
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ error: "Report not found" });

    // Get restorer info for logging
    const restorer = await User.findById(restoredBy);
    const restorerName = restorer ? restorer.name : "Admin";

    // ✅ Restore by setting status back to Pending
    report.status = "Pending";
    report.updatedAt = new Date();
    await report.save();

    // ✅ Log restoration
    await logAction(
      restoredBy,
      restorer?.id_number || "N/A",
      restorerName,
      "Report Restored",
      `Report ${report._id} restored from archive by ${restorerName}`
    );

    res.json({
      message: "Report restored successfully",
      report,
    });
  } catch (err) {
    console.error("❌ Error restoring report:", err);
    res.status(500).json({ error: err.message });
  }
};

/* ------------------------------------------------
   ✅ Delete Archived Report (Permanently delete)
------------------------------------------------ */
exports.deleteArchivedReport = async (req, res) => {
  try {
    const { deletedBy } = req.body;
    const report = await Report.findById(req.params.id);
    
    if (!report) return res.status(404).json({ message: "Report not found" });

    // Get deleter info for logging
    const deleter = await User.findById(deletedBy);
    const deleterName = deleter ? deleter.name : "Admin";

    // ✅ Log before deletion
    await logAction(
      deletedBy,
      deleter?.id_number || "N/A",
      deleterName,
      "Report Deleted",
      `Report ${report._id} permanently deleted by ${deleterName}`
    );

    const deleted = await Report.findByIdAndDelete(req.params.id);

    res.sendStatus(204);
  } catch (err) {
    console.error("❌ Error deleting report:", err);
    res.status(500).json({
      message: "Failed to delete report",
      error: err.message,
    });
  }
};

/* ------------------------------------------------
   ✅ Assign Report to Staff
------------------------------------------------ */
exports.assignReport = async (req, res) => {
  try {
    const { staffId, assignedBy } = req.body;

    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: "Report not found" });

    // Get assigner and staff info for logging
    const assigner = await User.findById(assignedBy);
    const staff = await User.findById(staffId);
    
    if (!staff) return res.status(404).json({ message: "Staff not found" });

    const assignerName = assigner ? assigner.name : "Admin";
    const staffName = staff.name;

    // ✅ Check if staff is already assigned to this report
    if (report.assignedTo && report.assignedTo.toString() === staffId) {
      return res.status(400).json({ 
        message: "This staff is already assigned to this report" 
      });
    }

    const previousAssignee = report.assignedTo ? await User.findById(report.assignedTo) : null;
    const previousAssigneeName = previousAssignee ? previousAssignee.name : "Unassigned";

    report.assignedTo = staffId;
    if (assignedBy) report.assignedBy = assignedBy;
    report.status = "Pending";
    report.updatedAt = new Date();

    await report.save();

    // ✅ Log assignment
    await logAction(
      assignedBy,
      assigner?.id_number || "N/A",
      assignerName,
      "Report Assigned",
      `Report ${report._id} reassigned from ${previousAssigneeName} to ${staffName} by ${assignerName}`
    );

    // ✅ Notify staff - FIXED: using valid enum value "report"
    await Notification.create({
      userId: staffId,
      reportId: report._id,
      message: `A new ${report.category} report has been assigned to you (${report.floor} - ${report.room}).`,
      type: "report", // ✅ Fixed: changed from "report-assignment" to "report"
      status: "New",
      isRead: false,
      dismissed: false,
    });

    res.json({
      message: "Report assigned to staff successfully",
      report,
    });
  } catch (err) {
    console.error("❌ Error assigning report:", err);
    res.status(500).json({ error: err.message });
  }
};

/* ------------------------------------------------
   ✅ Get Reports by Staff
------------------------------------------------ */
exports.getReportsByStaff = async (req, res) => {
  try {
    const staffId = req.params.staffId;
    const reports = await Report.find({ assignedTo: staffId })
      .sort({ createdAt: -1 })
      .populate("userId", "name email");
    res.json(reports);
  } catch (err) {
    console.error("❌ Error fetching staff reports:", err);
    res.status(500).json({ error: err.message });
  }
};