const bcrypt = require("bcryptjs");
const User = require("../models/User");

async function applyUserUpdates(id, updates) {
  if (updates.password) {
    if (updates.password.length < 8) throw new Error("Password must be at least 8 characters.");
    const salt = await bcrypt.genSalt(10);
    updates.password = await bcrypt.hash(updates.password, salt);
  } else {
    delete updates.password;
  }

  const updated = await User.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  }).select("-password");

  if (!updated) throw new Error("User not found.");
  return updated;
}

module.exports = applyUserUpdates;
