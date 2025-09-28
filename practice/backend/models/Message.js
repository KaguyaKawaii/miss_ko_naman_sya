const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  sender: {
    type: String, // Can be user ID, "admin", or floor name
    required: true
  },
  receiver: {
    type: String, // Can be user ID, "admin", floor name, or staff ID
    required: true
  },
  content: {
    type: String,
    required: true
  },
  senderType: {
    type: String,
    enum: ["user", "staff", "admin"],
    required: true
  },
  floor: {
    type: String, // For floor-specific messages
    required: false
  },
  displayName: {
    type: String, // How the sender appears (e.g., "Ground Floor Staff")
    required: false
  },
  read: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for better performance
messageSchema.index({ sender: 1, receiver: 1 });
messageSchema.index({ receiver: 1, sender: 1 });
messageSchema.index({ floor: 1 });
messageSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Message", messageSchema);