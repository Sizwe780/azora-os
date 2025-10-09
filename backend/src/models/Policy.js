const mongoose = require('mongoose');

const PolicySchema = new mongoose.Schema({
  title: String,
  description: String,
  corridor: String,
  effectiveDate: Date,
  status: { type: String, enum: ['active', 'archived'], default: 'active' },
});

module.exports = mongoose.model('Policy', PolicySchema);
