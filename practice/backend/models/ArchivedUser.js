const mongoose = require("mongoose"); // ✅ ADD THIS
// const User = require("./User"); // optional, you can copy fields manually

const archivedUserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    id_number: { type: String, required: true },
    password: { type: String },
    department: { type: String },
    course: { type: String },
    year_level: { type: String },
    floor: { type: String },
    role: { type: String, required: true },
    verified: { type: Boolean, default: false },
    profilePicture: { type: String },
    archivedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.ArchivedUser ||
  mongoose.model("ArchivedUser", archivedUserSchema);
