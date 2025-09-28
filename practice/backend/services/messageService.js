const mongoose = require("mongoose");
const Message = require("../models/Message");
const User = require("../models/User");

/**
 * Utility functions for display names
 */
const getFloorStaffDisplayName = (floor) => {
  return `${floor} Staff`;
};

const getAdminDisplayName = () => {
  return "Admin";
};

/**
 * User → Floor messaging
 */
exports.sendMessageToFloor = async (userId, floor, content) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const newMessage = await new Message({
    sender: userId,
    receiver: floor,
    content: content,
    senderType: "user",
    floor: floor,
    createdAt: new Date(),
  }).save();

  const senderName = user.name || "User";

  return { 
    ...newMessage.toObject(), 
    senderName,
    displayName: senderName
  };
};

/**
 * User → Admin messaging
 */
exports.sendMessageToAdmin = async (userId, content) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const newMessage = await new Message({
    sender: userId,
    receiver: "admin",
    content: content,
    senderType: "user",
    createdAt: new Date(),
  }).save();

  const senderName = user.name || "User";

  return { 
    ...newMessage.toObject(), 
    senderName,
    displayName: senderName
  };
};

/**
 * Staff → User messaging (appears as floor staff)
 */
exports.sendMessageFromStaff = async (staffId, userId, content) => {
  const staff = await User.findById(staffId);
  if (!staff) throw new Error("Staff not found");

  if (!staff.floor) {
    throw new Error("Staff member must be assigned to a floor");
  }

  const newMessage = await new Message({
    sender: staffId,
    receiver: userId,
    content: content,
    senderType: "staff",
    displayName: getFloorStaffDisplayName(staff.floor),
    floor: staff.floor,
    createdAt: new Date(),
  }).save();

  return { 
    ...newMessage.toObject(), 
    senderName: staff.name,
    displayName: getFloorStaffDisplayName(staff.floor)
  };
};

/**
 * Staff → Admin messaging
 */
exports.sendMessageFromStaffToAdmin = async (staffId, content) => {
  const staff = await User.findById(staffId);
  if (!staff) throw new Error("Staff not found");

  const newMessage = await new Message({
    sender: staffId,
    receiver: "admin",
    content: content,
    senderType: "staff",
    displayName: staff.name,
    floor: staff.floor,
    createdAt: new Date(),
  }).save();

  return { 
    ...newMessage.toObject(), 
    senderName: staff.name,
    displayName: staff.name
  };
};

/**
 * Admin → User messaging
 */
exports.sendMessageFromAdminToUser = async (userId, content) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const newMessage = await new Message({
    sender: "admin",
    receiver: userId,
    content: content,
    senderType: "admin",
    displayName: getAdminDisplayName(),
    createdAt: new Date(),
  }).save();

  return { 
    ...newMessage.toObject(), 
    senderName: "Admin",
    displayName: getAdminDisplayName()
  };
};

/**
 * Admin → Staff messaging
 */
exports.sendMessageFromAdminToStaff = async (staffId, content) => {
  const staff = await User.findById(staffId);
  if (!staff) throw new Error("Staff not found");

  const newMessage = await new Message({
    sender: admin._id,
    receiver: staffId,
    content: content,
    senderType: "admin",
    displayName: getAdminDisplayName(),
    createdAt: new Date(),
  }).save();

  return { 
    ...newMessage.toObject(), 
    senderName: "Admin",
    displayName: getAdminDisplayName()
  };
};

/**
 * Admin → Floor messaging
 */
exports.sendMessageFromAdminToFloor = async (floor, content) => {
  const newMessage = await new Message({
    sender: admin._id,
    receiver: floor,
    content: content,
    senderType: "admin",
    displayName: getAdminDisplayName(),
    floor: floor,
    createdAt: new Date(),
  }).save();

  return { 
    ...newMessage.toObject(), 
    senderName: "Admin",
    displayName: getAdminDisplayName()
  };
};

/**
 * Conversation fetching methods
 */
exports.getFloorConversation = async (userId, floor) => {
  const query = {
    $or: [
      { sender: userId, receiver: floor },
      { receiver: userId, floor: floor }
    ]
  };

  const msgs = await Message.find(query).sort({ createdAt: 1 });

  const processedMessages = await Promise.all(msgs.map(async (msg) => {
    const messageObj = msg.toObject();
    
    if (msg.senderType === "staff" && msg.displayName) {
      messageObj.senderName = msg.displayName;
    } else if (msg.senderType === "user") {
      const user = await User.findById(msg.sender);
      messageObj.senderName = user ? user.name : "User";
    } else if (msg.sender === "admin") {
      messageObj.senderName = "Admin";
    }

    return messageObj;
  }));

  return processedMessages;
};

exports.getUserAdminConversation = async (userId) => {
  const query = {
    $or: [
      { sender: userId, receiver: "admin" },
      { sender: "admin", receiver: userId }
    ]
  };

  const msgs = await Message.find(query).sort({ createdAt: 1 });

  const processedMessages = await Promise.all(msgs.map(async (msg) => {
    const messageObj = msg.toObject();
    
    if (msg.senderType === "user") {
      const user = await User.findById(msg.sender);
      messageObj.senderName = user ? user.name : "User";
    } else if (msg.sender === "admin") {
      messageObj.senderName = "Admin";
    }

    return messageObj;
  }));

  return processedMessages;
};

exports.getStaffUserConversation = async (staffId, userId) => {
  const staff = await User.findById(staffId);
  if (!staff || !staff.floor) throw new Error("Staff not found or no floor assigned");

  const query = {
    $or: [
      { sender: userId, receiver: staff.floor },
      { sender: staffId, receiver: userId },
      { receiver: userId, floor: staff.floor, senderType: "staff" }
    ]
  };

  const msgs = await Message.find(query).sort({ createdAt: 1 });

  const processedMessages = await Promise.all(msgs.map(async (msg) => {
    const messageObj = msg.toObject();
    
    if (msg.senderType === "staff") {
      messageObj.senderName = getFloorStaffDisplayName(staff.floor);
    } else if (msg.senderType === "user") {
      const user = await User.findById(msg.sender);
      messageObj.senderName = user ? user.name : "User";
    }

    return messageObj;
  }));

  return processedMessages;
};

exports.getStaffAdminConversation = async (staffId) => {
  const query = {
    $or: [
      { sender: staffId, receiver: "admin" },
      { sender: "admin", receiver: staffId }
    ]
  };

  const msgs = await Message.find(query).sort({ createdAt: 1 });

  const processedMessages = await Promise.all(msgs.map(async (msg) => {
    const messageObj = msg.toObject();
    
    if (msg.senderType === "staff") {
      const staff = await User.findById(msg.sender);
      messageObj.senderName = staff ? staff.name : "Staff";
    } else if (msg.sender === "admin") {
      messageObj.senderName = "Admin";
    }

    return messageObj;
  }));

  return processedMessages;
};

exports.getAdminConversation = async (entityId) => {
  const query = {
    $or: [
      { sender: "admin", receiver: entityId },
      { sender: entityId, receiver: "admin" }
    ]
  };

  const msgs = await Message.find(query).sort({ createdAt: 1 });

  const processedMessages = await Promise.all(msgs.map(async (msg) => {
    const messageObj = msg.toObject();
    
    if (msg.sender === "admin") {
      messageObj.senderName = "Admin";
    } else {
      const user = await User.findById(msg.sender);
      if (user) {
        messageObj.senderName = user.name;
      } else {
        messageObj.senderName = "Unknown";
      }
    }

    return messageObj;
  }));

  return processedMessages;
};

/**
 * Recipient list methods
 */
exports.getFloorUsers = async (floor) => {
  const userMessages = await Message.find({ 
    receiver: floor,
    senderType: "user"
  }).distinct("sender");

  const validUserIds = userMessages.filter(id => mongoose.Types.ObjectId.isValid(id));
  
  const users = await User.find({ _id: { $in: validUserIds } }, "_id name email");
  
  const usersWithMessages = await Promise.all(users.map(async (user) => {
    const latestMessage = await Message.findOne({
      $or: [
        { sender: user._id, receiver: floor },
        { receiver: user._id, floor: floor }
      ]
    }).sort({ createdAt: -1 });

    const unreadCount = await Message.countDocuments({
      receiver: user._id,
      floor: floor,
      read: false
    });

    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      latestMessage: latestMessage?.content,
      latestMessageAt: latestMessage?.createdAt,
      unreadCount: unreadCount
    };
  }));

  return usersWithMessages.sort((a, b) => 
    new Date(b.latestMessageAt || 0) - new Date(a.latestMessageAt || 0)
  );
};

exports.getAdminRecipients = async () => {
  const recipients = [];

  // Add floors
  const floors = ["Ground Floor", "Second Floor", "Third Floor", "Fourth Floor", "Fifth Floor"];
  
  for (const floor of floors) {
    const latestMessage = await Message.findOne({
      $or: [
        { sender: "admin", receiver: floor },
        { receiver: "admin", floor: floor }
      ]
    }).sort({ createdAt: -1 });

    recipients.push({
      _id: floor,
      name: floor,
      type: "floor",
      latestMessageAt: latestMessage?.createdAt || new Date(0),
      latestMessage: latestMessage?.content || "No messages yet"
    });
  }

  // Add users who messaged admin
  const userMessages = await Message.find({
    receiver: "admin",
    senderType: "user"
  }).distinct("sender");

  const validUserIds = userMessages.filter(id => mongoose.Types.ObjectId.isValid(id));
  const users = await User.find({ _id: { $in: validUserIds } }, "_id name email role");

  for (const user of users) {
    const latestMessage = await Message.findOne({
      $or: [
        { sender: user._id, receiver: "admin" },
        { sender: "admin", receiver: user._id }
      ]
    }).sort({ createdAt: -1 });

    recipients.push({
      _id: user._id.toString(),
      name: user.name,
      type: user.role === "staff" ? "staff" : "user",
      latestMessageAt: latestMessage?.createdAt || new Date(0),
      latestMessage: latestMessage?.content || "No messages yet"
    });
  }

  // Add staff who messaged admin
  const staffMessages = await Message.find({
    receiver: "admin",
    senderType: "staff"
  }).distinct("sender");

  const validStaffIds = staffMessages.filter(id => mongoose.Types.ObjectId.isValid(id));
  const staff = await User.find({ _id: { $in: validStaffIds } }, "_id name email");

  for (const staffMember of staff) {
    const latestMessage = await Message.findOne({
      $or: [
        { sender: staffMember._id, receiver: "admin" },
        { sender: "admin", receiver: staffMember._id }
      ]
    }).sort({ createdAt: -1 });

    if (!recipients.find(r => r._id === staffMember._id.toString())) {
      recipients.push({
        _id: staffMember._id.toString(),
        name: staffMember.name,
        type: "staff",
        latestMessageAt: latestMessage?.createdAt || new Date(0),
        latestMessage: latestMessage?.content || "No messages yet"
      });
    }
  }

  return recipients.sort((a, b) => 
    new Date(b.latestMessageAt || 0) - new Date(a.latestMessageAt || 0)
  );
};

exports.getStaffRecipients = async (staffId) => {
  const staff = await User.findById(staffId);
  if (!staff) throw new Error("Staff not found");

  const recipients = [];

  // Add admin
  const adminMessages = await Message.findOne({
    $or: [
      { sender: staffId, receiver: "admin" },
      { sender: "admin", receiver: staffId }
    ]
  }).sort({ createdAt: -1 });

  recipients.push({
    _id: "admin",
    name: "Admin",
    type: "admin",
    latestMessageAt: adminMessages?.createdAt || new Date(0),
    latestMessage: adminMessages?.content || "No messages yet"
  });

  // Add floor users
  if (staff.floor) {
    const floorUsers = await this.getFloorUsers(staff.floor);
    floorUsers.forEach(user => {
      recipients.push({
        _id: user._id.toString(),
        name: user.name,
        type: "user",
        floor: staff.floor,
        latestMessageAt: user.latestMessageAt || new Date(0),
        latestMessage: user.latestMessage || "No messages yet",
        unreadCount: user.unreadCount
      });
    });
  }

  return recipients.sort((a, b) => 
    new Date(b.latestMessageAt || 0) - new Date(a.latestMessageAt || 0)
  );
};