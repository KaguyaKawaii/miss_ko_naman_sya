// models/Log.js
const mongoose = require("mongoose");

const logSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    id_number: { type: String }, // ✅ consistent with User schema
    userName: { type: String },
    action: { type: String, required: true },
    details: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Log", logSchema);
