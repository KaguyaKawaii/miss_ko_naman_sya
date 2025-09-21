const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");

// Recipients list
router.get("/recipients/:userId", messageController.getRecipients);

// Conversation
router.get("/conversation/:userId/:recipientId", messageController.getConversation);

// Send message
router.post("/", messageController.sendMessage);

// Archive / Restore / Get archived
router.put("/archive/:id", messageController.archiveMessage);
router.put("/restore/:id", messageController.restoreMessage);
router.get("/archived", messageController.getArchivedMessages);

module.exports = router;
