const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

/* Helper — PH time (UTC+8) */
function nowPH() {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc + 480 * 60000);
}

const userSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  email:       { type: String, lowercase: true, unique: true, required: true },
  id_number:   { type: String, required: true },
  password:    { type: String, required: true },

  department:  { type: String, default: "N/A" },
  course:      { type: String, default: "N/A" },
  year_level:  { type: String, default: "N/A" },  // use snake_case in DB consistently

  role: {
    type: String,
    enum: ["Student", "Faculty", "Staff"],
    default: "Student",
  },

  verified:   { type: Boolean, default: false },
  created_at: { type: Date, default: nowPH },
});

/* Virtual for frontend-friendly camelCase (.yearLevel) */
userSchema
  .virtual("yearLevel")
  .get(function () {
    return this.year_level;
  })
  .set(function (val) {
    this.year_level = val;
  });

/* Remove virtuals when converting to JSON/Objects */
userSchema.set("toJSON", { virtuals: true });
userSchema.set("toObject", { virtuals: true });

/* Password hashing + auto-verify Faculty/Staff */
userSchema.pre("save", async function (next) {
  // Only hash if new or password is modified
  if (this.isNew || this.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }

  // Auto-verify for Faculty/Staff upon creation
  if (this.isNew && ["Faculty", "Staff"].includes(this.role)) {
    this.verified = true;
  }

  next();
});

module.exports = mongoose.models.User || mongoose.model("User", userSchema);
