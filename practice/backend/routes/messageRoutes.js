const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");

// Generic message sending route
router.post("/send", messageController.sendMessage);

// User routes
router.post("/send-to-floor", messageController.sendMessageToFloor);
router.post("/send-to-admin", messageController.sendMessageToAdmin);

// Staff routes
router.post("/staff-reply", messageController.staffReplyToUser);
router.post("/staff-to-admin", messageController.staffMessageToAdmin);

// Admin routes
router.post("/admin-to-user", messageController.adminMessageToUser);
router.post("/admin-to-staff", messageController.adminMessageToStaff);
router.post("/admin-to-floor", messageController.adminMessageToFloor);

// Conversation fetching routes
router.get("/floor-conversation/:userId/:floor", messageController.getFloorConversation);
router.get("/user-admin-conversation/:userId", messageController.getUserAdminConversation);
router.get("/staff-user-conversation/:staffId/:userId", messageController.getStaffUserConversation);
router.get("/staff-admin-conversation/:staffId", messageController.getStaffAdminConversation);
router.get("/admin-conversation/:entityId", messageController.getAdminConversation);

// Recipient list routes
router.get("/floor-users/:floor", messageController.getFloorUsers);
router.get("/recipients/admin", messageController.getAdminRecipients);
router.get("/recipients/staff/:staffId", messageController.getStaffRecipients);

module.exports = router;