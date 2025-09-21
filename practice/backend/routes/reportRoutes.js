const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");

router.get("/", reportController.getReports);
router.get("/archived", reportController.getArchivedReports);
router.post("/", reportController.createReport);
router.put("/archive/:id", reportController.archiveReport);
router.put("/restore/:id", reportController.restoreReport);
router.delete("/:id", reportController.deleteArchivedReport);
router.get("/:id", reportController.getReportById);


module.exports = router;
