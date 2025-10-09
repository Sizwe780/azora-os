const mongoose = require('mongoose');

const ShiftSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  corridor: String,
  start: Date,
  end: Date,
  status: { type: String, enum: ['scheduled', 'active', 'completed'], default: 'scheduled' },
});

module.exports = mongoose.model('Shift', ShiftSchema);
