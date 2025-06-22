// =========================
// models/Message.js
// =========================
const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  receiver: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.models.Message || mongoose.model("Message", messageSchema);