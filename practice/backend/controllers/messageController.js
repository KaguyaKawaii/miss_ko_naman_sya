const messageService = require("../services/messageService");

/* ───────────────────────────────
   User Messaging Endpoints
─────────────────────────────── */
// Generic sendMessage endpoint (handles admin, user, staff, floor)
exports.sendMessage = async (req, res) => {
  try {
    const { sender, receiver, content } = req.body;

    if (!sender || !receiver || !content) {
      return res.status(400).json({ message: "Missing sender, receiver, or content" });
    }

    let messageData;

    // Decide routing logic
    if (sender === "admin") {
      if (receiver.includes("Floor")) {
        messageData = await messageService.sendMessageFromAdminToFloor(receiver, content);
      } else {
        messageData = await messageService.sendMessageFromAdminToUser(receiver, content);
      }
    } else if (receiver === "admin") {
      messageData = await messageService.sendMessageToAdmin(sender, content);
    } else if (receiver.includes("Floor")) {
      messageData = await messageService.sendMessageToFloor(sender, receiver, content);
    } else {
      // fallback: user-to-user (optional if you allow)
      messageData = await messageService.sendMessageUserToUser(sender, receiver, content);
    }

    const io = req.app.get("io");

    // Notify both sender and receiver rooms
    io.to(sender).emit("newMessage", messageData);
    io.to(receiver).emit("newMessage", messageData);

    res.status(201).json(messageData);
  } catch (err) {
    console.error("Failed to send message:", err);
    res.status(500).json({ message: "Failed to send message." });
  }
};



// User sends message to floor
exports.sendMessageToFloor = async (req, res) => {
  try {
    const { userId, floor, content } = req.body;
    
    const messageData = await messageService.sendMessageToFloor(userId, floor, content);

    const io = req.app.get("io");
    
    // Notify floor staff and user
    io.to(floor).emit("newMessage", messageData);
    io.to(userId).emit("newMessage", messageData);

    res.status(201).json({ message: "Message sent to floor", data: messageData });
  } catch (err) {
    console.error("Failed to send floor message:", err);
    res.status(500).json({ message: "Failed to send message to floor." });
  }
};

// User sends message to admin
exports.sendMessageToAdmin = async (req, res) => {
  try {
    const { userId, content } = req.body;
    
    const messageData = await messageService.sendMessageToAdmin(userId, content);

    const io = req.app.get("io");
    
    // Notify admin and user
    io.to("admin").emit("newMessage", messageData);
    io.to(userId).emit("newMessage", messageData);

    res.status(201).json({ message: "Message sent to admin", data: messageData });
  } catch (err) {
    console.error("Failed to send admin message:", err);
    res.status(500).json({ message: "Failed to send message to admin." });
  }
};

/* ───────────────────────────────
   Staff Messaging Endpoints
─────────────────────────────── */

// Staff replies to user (appears as floor staff)
exports.staffReplyToUser = async (req, res) => {
  try {
    const { staffId, userId, content } = req.body;
    
    const messageData = await messageService.sendMessageFromStaff(staffId, userId, content);

    const io = req.app.get("io");
    
    // Emit to user and staff
    io.to(userId).emit("newMessage", messageData);
    io.to(staffId).emit("newMessage", messageData);

    res.status(201).json({ message: "Message sent", data: messageData });
  } catch (err) {
    console.error("Failed to send staff reply:", err);
    res.status(500).json({ message: "Failed to send message." });
  }
};

// Staff sends message to admin
exports.staffMessageToAdmin = async (req, res) => {
  try {
    const { staffId, content } = req.body;
    
    const messageData = await messageService.sendMessageFromStaffToAdmin(staffId, content);

    const io = req.app.get("io");
    
    // Emit to admin and staff
    io.to("admin").emit("newMessage", messageData);
    io.to(staffId).emit("newMessage", messageData);

    res.status(201).json({ message: "Message sent to admin", data: messageData });
  } catch (err) {
    console.error("Failed to send staff message to admin:", err);
    res.status(500).json({ message: "Failed to send message to admin." });
  }
};

/* ───────────────────────────────
   Admin Messaging Endpoints
─────────────────────────────── */

// Admin sends message to user
exports.adminMessageToUser = async (req, res) => {
  try {
    const { userId, content } = req.body;
    
    const messageData = await messageService.sendMessageFromAdminToUser(userId, content);

    const io = req.app.get("io");
    
    // Emit to user and admin
    io.to(userId).emit("newMessage", messageData);
    io.to("admin").emit("newMessage", messageData);

    res.status(201).json({ message: "Message sent to user", data: messageData });
  } catch (err) {
    console.error("Failed to send admin message to user:", err);
    res.status(500).json({ message: "Failed to send message to user." });
  }
};

// Admin sends message to staff
exports.adminMessageToStaff = async (req, res) => {
  try {
    const { staffId, content } = req.body;
    
    const messageData = await messageService.sendMessageFromAdminToStaff(staffId, content);

    const io = req.app.get("io");
    
    // Emit to staff and admin
    io.to(staffId).emit("newMessage", messageData);
    io.to("admin").emit("newMessage", messageData);

    res.status(201).json({ message: "Message sent to staff", data: messageData });
  } catch (err) {
    console.error("Failed to send admin message to staff:", err);
    res.status(500).json({ message: "Failed to send message to staff." });
  }
};

// Admin sends message to floor
exports.adminMessageToFloor = async (req, res) => {
  try {
    const { floor, content } = req.body;
    
    const messageData = await messageService.sendMessageFromAdminToFloor(floor, content);

    const io = req.app.get("io");
    
    // Emit to floor and admin
    io.to(floor).emit("newMessage", messageData);
    io.to("admin").emit("newMessage", messageData);

    res.status(201).json({ message: "Message sent to floor", data: messageData });
  } catch (err) {
    console.error("Failed to send admin message to floor:", err);
    res.status(500).json({ message: "Failed to send message to floor." });
  }
};

/* ───────────────────────────────
   Conversation Fetching Endpoints
─────────────────────────────── */

// Get floor conversation (user perspective)
exports.getFloorConversation = async (req, res) => {
  try {
    const { userId, floor } = req.params;
    
    const messages = await messageService.getFloorConversation(userId, floor);
    res.json(messages);
  } catch (err) {
    console.error("Failed to fetch floor conversation:", err);
    res.status(500).json({ message: "Failed to fetch conversation." });
  }
};

// Get user-admin conversation
exports.getUserAdminConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const messages = await messageService.getUserAdminConversation(userId);
    res.json(messages);
  } catch (err) {
    console.error("Failed to fetch user-admin conversation:", err);
    res.status(500).json({ message: "Failed to fetch conversation." });
  }
};

// Get staff's conversation with a user
exports.getStaffUserConversation = async (req, res) => {
  try {
    const { staffId, userId } = req.params;
    
    const messages = await messageService.getStaffUserConversation(staffId, userId);
    res.json(messages);
  } catch (err) {
    console.error("Failed to fetch staff-user conversation:", err);
    res.status(500).json({ message: "Failed to fetch conversation." });
  }
};

// Get staff-admin conversation
exports.getStaffAdminConversation = async (req, res) => {
  try {
    const { staffId } = req.params;
    
    const messages = await messageService.getStaffAdminConversation(staffId);
    res.json(messages);
  } catch (err) {
    console.error("Failed to fetch staff-admin conversation:", err);
    res.status(500).json({ message: "Failed to fetch conversation." });
  }
};

// Get admin conversation with any entity
exports.getAdminConversation = async (req, res) => {
  try {
    const { entityId } = req.params;
    
    const messages = await messageService.getAdminConversation(entityId);
    res.json(messages);
  } catch (err) {
    console.error("Failed to fetch admin conversation:", err);
    res.status(500).json({ message: "Failed to fetch conversation." });
  }
};

/* ───────────────────────────────
   List/Recipient Endpoints
─────────────────────────────── */

// Get users for a floor (staff perspective)
exports.getFloorUsers = async (req, res) => {
  try {
    const { floor } = req.params;
    
    const users = await messageService.getFloorUsers(floor);
    res.json(users);
  } catch (err) {
    console.error("Failed to fetch floor users:", err);
    res.status(500).json({ message: "Failed to fetch floor users." });
  }
};

// Get all recipients for admin
exports.getAdminRecipients = async (req, res) => {
  try {
    const recipients = await messageService.getAdminRecipients();
    res.json(recipients);
  } catch (err) {
    console.error("Failed to fetch admin recipients:", err);
    res.status(500).json({ message: "Failed to fetch recipients." });
  }
};

// Get recipients for staff
exports.getStaffRecipients = async (req, res) => {
  try {
    const { staffId } = req.params;
    
    const recipients = await messageService.getStaffRecipients(staffId);
    res.json(recipients);
  } catch (err) {
    console.error("Failed to fetch staff recipients:", err);
    res.status(500).json({ message: "Failed to fetch recipients." });
  }
};