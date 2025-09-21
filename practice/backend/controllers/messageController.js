const messageService = require("../services/messageService");

/* ───────────────────────────────
   1. Recipients list
─────────────────────────────── */
exports.getRecipients = async (req, res) => {
  try {
    const recipients = await messageService.getRecipients(req.params.userId);
    res.json(recipients);
  } catch (err) {
    console.error("Failed to fetch recipients:", err);
    res.status(500).json({ message: "Failed to fetch recipients." });
  }
};

/* ───────────────────────────────
   2. Conversation
─────────────────────────────── */
exports.getConversation = async (req, res) => {
  try {
    const msgs = await messageService.getConversation(req.params.userId, req.params.recipientId);
    res.json(msgs);
  } catch (err) {
    console.error("Failed to fetch conversation:", err);
    res.status(500).json({ message: "Failed to fetch conversation." });
  }
};

/* ───────────────────────────────
   3. Send message
─────────────────────────────── */
exports.sendMessage = async (req, res) => {
  try {
    const { sender, receiver, content } = req.body;
    const messageData = await messageService.sendMessage(sender, receiver, content);

    // Emit message through Socket.IO
    const io = req.app.get("io");
    io.to([sender, receiver]).emit("newMessage", messageData);

    res.status(201).json({ message: "Message sent successfully", data: messageData });
  } catch (err) {
    console.error("Failed to send message:", err);
    res.status(500).json({ message: "Failed to send message." });
  }
};

/* ───────────────────────────────
   4. Archive / Restore / Get archived
─────────────────────────────── */
exports.archiveMessage = async (req, res) => {
  try {
    const message = await messageService.archiveMessage(req.params.id);
    if (!message) return res.status(404).json({ message: "Message not found" });
    res.json({ message: "Message archived successfully", data: message });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.restoreMessage = async (req, res) => {
  try {
    const message = await messageService.restoreMessage(req.params.id);
    if (!message) return res.status(404).json({ message: "Message not found" });
    res.json({ message: "Message restored successfully", data: message });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getArchivedMessages = async (req, res) => {
  try {
    const archived = await messageService.getArchivedMessages();
    res.json(archived);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
