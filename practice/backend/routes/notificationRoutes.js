const express = require("express");
const router = express.Router();

// Import the controller with error handling
let notificationController;
try {
  notificationController = require("../controllers/notificationController");
  console.log("✅ Notification controller loaded successfully");
} catch (error) {
  console.error("❌ Failed to load notification controller:", error);
  // Create dummy functions to prevent crashes
  notificationController = {
    getAllNotifications: (req, res) => res.status(500).json({ message: "Controller not loaded" }),
    createNotification: (req, res) => res.status(500).json({ message: "Controller not loaded" }),
    getUserNotifications: (req, res) => res.status(500).json({ message: "Controller not loaded" }),
    getStaffNotifications: (req, res) => res.status(500).json({ message: "Controller not loaded" }),
    markAsRead: (req, res) => res.status(500).json({ message: "Controller not loaded" }),
    markAllAsRead: (req, res) => res.status(500).json({ message: "Controller not loaded" }),
    getUnreadCount: (req, res) => res.status(500).json({ message: "Controller not loaded" }),
    getReportNotifications: (req, res) => res.status(500).json({ message: "Controller not loaded" }),
    markAsDismissed: (req, res) => res.status(500).json({ message: "Controller not loaded" })
  };
}

// Debug: Check if all controller methods are functions
console.log("🔍 Checking controller methods:");
Object.keys(notificationController).forEach(key => {
  console.log(`  ${key}: ${typeof notificationController[key]}`);
});

// 📌 Get all notifications (admin)
router.get("/", notificationController.getAllNotifications);

// 📌 Create a new notification
router.post("/", notificationController.createNotification);

// 📌 Get user-specific notifications
router.get("/user/:userId", notificationController.getUserNotifications);

// 📌 Get staff-specific notifications
router.get("/staff/:staffId", notificationController.getStaffNotifications);

// 📌 Mark single notification as read
router.put("/:id/read", notificationController.markAsRead);

// 📌 Mark all as read for a user
router.put("/mark-all-read/:userId", notificationController.markAllAsRead);

// 📌 Get report notifications
router.get("/reports", notificationController.getReportNotifications);

// 📌 Mark as dismissed
router.put("/:id/dismiss", notificationController.markAsDismissed);

// 📌 Get unread count for a user
router.get("/unread-count/:userId", notificationController.getUnreadCount);

module.exports = router;