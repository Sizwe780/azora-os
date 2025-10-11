const mongoose = require('mongoose');

const TrainingRecordSchema = new mongoose.Schema({
  user: { type: String, required: true },
  module: { type: String, required: true },
  status: { type: String, required: true },
  corridor: { type: String },
  timestamp: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('TrainingRecord', TrainingRecordSchema);
