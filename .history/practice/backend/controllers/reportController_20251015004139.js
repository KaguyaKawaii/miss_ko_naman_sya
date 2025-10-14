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

    // 1️⃣ Create report (no auto-assignment)
    const newReport = await Report.create({
      reportedBy,
      userId,
      category,
      details,
      floor,
      room,
      status: "Pending",
      assignedTo: null,
    });

    // 2️⃣ Log report creation
    await logAction(
      userId,
      "Report Creator",
      reportedBy,
      "Report Created",
      `${reportedBy} created a ${category} report for ${floor} - ${room}`
    );

    // 3️⃣ Create notification (admins will see this) - SIMPLIFIED MESSAGE
    let notification = await Notification.create({
      userId: null,
      reportId: newReport._id,
      message: `New ${category} report submitted for ${floor} - ${room}`,
      type: "report",
      status: "New",
      isRead: false,
      dismissed: false,
    });

    // 4️⃣ Emit via socket.io if available
    notification = await notification.populate("reportId", "category floor room");
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
   ✅ Start Report (Staff begins work)
------------------------------------------------ */
exports.startReport = async (req, res) => {
  try {
    const { startedBy } = req.body;

    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    // Get staff info for logging
    let staffName = "Staff";
    let staffIdNumber = "N/A";
    
    if (startedBy) {
      const staff = await User.findById(startedBy);
      if (staff) {
        staffName = staff.name;
        staffIdNumber = staff.id_number || "N/A";
      }
    }

    // ✅ Update report status to "In Progress"
    const previousStatus = report.status;
    report.status = "In Progress";
    report.updatedAt = new Date();

    await report.save();

    // ✅ Log report start with staff name
    await logAction(
      startedBy || null,
      staffIdNumber,
      staffName,
      "Report Started",
      `Report ${report._id} for ${report.floor} - ${report.room} started by ${staffName}. Status changed from ${previousStatus} to In Progress`
    );

    // ✅ Notify user that work has started
    await Notification.create({
      userId: report.userId,
      reportId: report._id,
      message: `Work has started on your report for ${report.floor} - ${report.room}. Staff member ${staffName} is now working on it.`,
      type: "report",
      status: "New",
      isRead: false,
      dismissed: false,
    });

    res.status(200).json({
      message: "Report started successfully",
      report,
    });
  } catch (err) {
    console.error("❌ Error starting report:", err);
    res.status(500).json({
      message: "Failed to start report",
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

    // Get resolver info for logging
    let resolverName = "Admin";
    let resolverIdNumber = "N/A";
    
    if (resolvedBy) {
      const resolver = await User.findById(resolvedBy);
      if (resolver) {
        resolverName = resolver.name;
        resolverIdNumber = resolver.id_number || "N/A";
      }
    }

    // ✅ Update report status and action taken
    report.status = "Resolved";
    report.actionTaken = actionTaken.trim();
    report.resolvedAt = new Date();
    report.updatedAt = new Date();

    await report.save();

    // ✅ Log resolution with staff name
    await logAction(
      resolvedBy || null,
      resolverIdNumber,
      resolverName,
      "Report Resolved",
      `Report ${report._id} for ${report.floor} - ${report.room} resolved by ${resolverName}. Action: ${actionTaken}`
    );

    // ✅ Notify user about resolution
    await Notification.create({
      userId: report.userId,
      reportId: report._id,
      message: `Your report for ${report.floor} - ${report.room} has been resolved by ${resolverName}. Action taken: ${actionTaken}`,
      type: "report",
      status: "New",
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
    let updaterName = "Admin";
    let updaterIdNumber = "N/A";
    
    if (updatedBy) {
      const updater = await User.findById(updatedBy);
      if (updater) {
        updaterName = updater.name;
        updaterIdNumber = updater.id_number || "N/A";
      }
    }

    // ✅ Log status update
    await logAction(
      updatedBy || null,
      updaterIdNumber,
      updaterName,
      "Report Status Updated",
      `Report ${report._id} for ${report.floor} - ${report.room} status changed from ${previousStatus} to ${status} by ${updaterName}`
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
    let archiverName = "Admin";
    let archiverIdNumber = "N/A";
    
    if (archivedBy) {
      const archiver = await User.findById(archivedBy);
      if (archiver) {
        archiverName = archiver.name;
        archiverIdNumber = archiver.id_number || "N/A";
      }
    }

    // ✅ Update status to Archived instead of moving to archive collection
    report.status = "Archived";
    report.updatedAt = new Date();
    await report.save();

    // ✅ Log archiving
    await logAction(
      archivedBy || null,
      archiverIdNumber,
      archiverName,
      "Report Archived",
      `Report ${report._id} for ${report.floor} - ${report.room} archived by ${archiverName}`
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
    let restorerName = "Admin";
    let restorerIdNumber = "N/A";
    
    if (restoredBy) {
      const restorer = await User.findById(restoredBy);
      if (restorer) {
        restorerName = restorer.name;
        restorerIdNumber = restorer.id_number || "N/A";
      }
    }

    // ✅ Restore by setting status back to Pending
    report.status = "Pending";
    report.updatedAt = new Date();
    await report.save();

    // ✅ Log restoration
    await logAction(
      restoredBy || null,
      restorerIdNumber,
      restorerName,
      "Report Restored",
      `Report ${report._id} for ${report.floor} - ${report.room} restored from archive by ${restorerName}`
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
    let deleterName = "Admin";
    let deleterIdNumber = "N/A";
    
    if (deletedBy) {
      const deleter = await User.findById(deletedBy);
      if (deleter) {
        deleterName = deleter.name;
        deleterIdNumber = deleter.id_number || "N/A";
      }
    }

    // ✅ Log before deletion
    await logAction(
      deletedBy || null,
      deleterIdNumber,
      deleterName,
      "Report Deleted",
      `Report ${report._id} for ${report.floor} - ${report.room} permanently deleted by ${deleterName}`
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
    let assignerName = "Admin";
    let assignerIdNumber = "N/A";
    
    if (assignedBy) {
      const assigner = await User.findById(assignedBy);
      if (assigner) {
        assignerName = assigner.name;
        assignerIdNumber = assigner.id_number || "N/A";
      }
    }

    const staff = await User.findById(staffId);
    if (!staff) return res.status(404).json({ message: "Staff not found" });

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
      assignedBy || null,
      assignerIdNumber,
      assignerName,
      "Report Assigned",
      `Report ${report._id} for ${report.floor} - ${report.room} reassigned from ${previousAssigneeName} to ${staffName} by ${assignerName}`
    );

    // ✅ Notify staff
    await Notification.create({
      userId: staffId,
      reportId: report._id,
      message: `A new ${report.category} report has been assigned to you (${report.floor} - ${report.room}).`,
      type: "report",
      status: "New",
      isRead: false,
      dismissed: false,
    });

    res.json({
      message: `Report assigned to ${staffName} successfully`,
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