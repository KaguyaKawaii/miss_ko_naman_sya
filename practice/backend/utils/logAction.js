const Log = require("../models/Log");

async function logAction(userId, id_number, userName, action, details = "") {
  try {
    await Log.create({
      userId,
      id_number,   // ✅ matches Log schema + frontend
      userName,
      action,
      details,
    });
  } catch (err) {
    console.error("Error logging action:", err);
  }
}

module.exports = logAction;
