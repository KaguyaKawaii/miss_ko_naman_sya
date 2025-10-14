const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");

// 📌 Reports for Admin
router.get("/", reportController.getReports);                  // All reports
router.get("/archived", reportController.getArchivedReports);  // Archived reports
router.get("/:id", reportController.getReportById);            // Get one report by ID

// 📌 Report creation
router.post("/", reportController.createReport);               // User creates a report

// 📌 Report workflow
router.put("/resolve/:id", reportController.resolveReport);    // Mark resolved
router.put("/archive/:id", reportController.archiveReport);    // Archive
router.put("/restore/:id", reportController.restoreReport);    // Restore
router.put("/assign/:id", reportController.assignReport);      // Assign to staff
router.put("/:id", reportController.updateReportStatus);       // General status update

// 📌 Staff-specific
router.get("/staff/:staffId", reportController.getReportsByStaff); // Reports for a staff

// 📌 Delete (only archived)
router.delete("/:id", reportController.deleteArchivedReport);

module.exports = router;
