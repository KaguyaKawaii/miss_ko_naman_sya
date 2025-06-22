const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

function nowPH() {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc + 480 * 60000);
}

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, lowercase: true, unique: true },
  id_number: String,
  password: String,
  department: String,
  course: String,
  yearLevel: String,
  role: {
    type: String,
    enum: ["Student", "Faculty", "Staff"],
    default: "Student",
  },
  verified: { type: Boolean, default: false },
  created_at: { type: Date, default: nowPH },
});

userSchema.pre("save", async function (next) {
  if (this.isNew) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    this.verified = ["Faculty", "Staff"].includes(this.role);
  }
  next();
});

module.exports = mongoose.models.User || mongoose.model("User", userSchema);
