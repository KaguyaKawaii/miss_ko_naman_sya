const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");

// ================== REPORT ROUTES ==================
router.get("/", reportController.getReports); // GET all reports
router.get("/archived", reportController.getArchivedReports); // GET archived reports
router.get("/staff/:staffId", reportController.getReportsByStaff); // GET reports by staff
router.get("/:id", reportController.getReportById); // GET report by ID

router.post("/", reportController.createReport); // CREATE new report
router.post("/:id/start", reportController.startReport); // START report (staff begins work)

router.put("/:id/status", reportController.updateReportStatus); // UPDATE report status
router.put("/:id/resolve", reportController.resolveReport); // RESOLVE report
router.put("/:id/archive", reportController.archiveReport); // ARCHIVE report
router.put("/:id/restore", reportController.restoreReport); // RESTORE report
router.put("/restore/:id", reportController.restoreReport); // ADD THIS LINE
router.put("/:id/assign", reportController.assignReport); // ASSIGN report to staff

router.delete("/:id", reportController.deleteArchivedReport); // DELETE archived report permanently

module.exports = router;