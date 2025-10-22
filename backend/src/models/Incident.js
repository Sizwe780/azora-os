/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

const mongoose = require('mongoose');

const IncidentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  details: String,
  corridor: String,
  status: { type: String, enum: ['reported', 'resolved'], default: 'reported' },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Incident', IncidentSchema);
