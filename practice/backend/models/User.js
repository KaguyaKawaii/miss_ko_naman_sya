const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Counter = require('./Counter');

const userSchema = new mongoose.Schema({
  id: Number,
  name: String,
  email: { type: String, unique: true },
  id_number: String,
  password: String,
  department: String,
  course: String,
  yearLevel: String,
  created_at: {
    type: Date,
    default: () => new Date(Date.now() + 8 * 60 * 60 * 1000),
  },
});

userSchema.pre('save', async function (next) {
  if (this.isNew) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        'userId',
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      this.id = counter.seq;

      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);

      next();
    } catch (err) {
      next(err);
    }
  } else {
    next();
  }
});

module.exports = mongoose.model('User', userSchema);