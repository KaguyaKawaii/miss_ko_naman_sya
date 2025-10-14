const Log = require("../models/Log");
const User = require("../models/User");

// 📌 Get all logs
exports.getAllLogs = async (req, res) => {
  try {
    const logs = await Log.find()
      .populate('userId', 'name id_number') // ✅ Add this line to populate user data
      .sort({ createdAt: -1 });
    
    res.json(logs);
  } catch (err) {
    console.error("Error fetching logs:", err);
    res.status(500).json({ error: "Failed to fetch logs" });
  }
};