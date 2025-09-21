const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");

// Routes
router.get("/", notificationController.getAllNotifications);
router.post("/", notificationController.createNotification);
router.get("/reports", notificationController.getReportNotifications);

router.patch("/:id/read", notificationController.markAsRead);
router.patch("/:id/dismiss", notificationController.markAsDismissed);

router.get("/user/:userId", notificationController.getUserNotifications);
router.get("/by-reservation/:id", notificationController.getByReservation);

router.delete("/:id", notificationController.deleteNotification);
router.put("/:id/expire", notificationController.markAsExpired);
router.put("/mark-all-read/:userId", notificationController.markAllAsRead);

module.exports = router;
