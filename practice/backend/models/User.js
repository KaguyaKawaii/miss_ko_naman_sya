// models/User.js
const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");

/* Helper — PH time */
function nowPH() {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc + 480 * 60000);        // UTC+8
}

const userSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  email:       { type: String, lowercase: true, unique: true, required: true },
  id_number:   { type: String, required: true },
  password:    { type: String, required: true },

  department:  { type: String, default: "N/A" },
  course:      { type: String, default: "N/A" },

  /* --- IMPORTANT: use snake_case in DB --- */
  year_level:  { type: String, default: "N/A" },

  role: {
    type:    String,
    enum:    ["Student", "Faculty", "Staff"],
    default: "Student",
  },

  verified:   { type: Boolean, default: false },
  created_at: { type: Date, default: nowPH },
});

/* Virtual so frontend can keep using .yearLevel */
userSchema
  .virtual("yearLevel")
  .get(function () {
    return this.year_level;
  })
  .set(function (val) {
    this.year_level = val;
  });

/* Remove virtuals when converting to JSON */
userSchema.set("toJSON", { virtuals: true });
userSchema.set("toObject", { virtuals: true });

/* Hash password + auto-verify Faculty/Staff */
userSchema.pre("save", async function (next) {
  if (this.isNew || this.isModified("password")) {
    const salt     = await bcrypt.genSalt(10);
    this.password  = await bcrypt.hash(this.password, salt);
  }
  if (this.isNew) {
    this.verified = ["Faculty", "Staff"].includes(this.role);
  }
  next();
});

module.exports = mongoose.models.User || mongoose.model("User", userSchema);
