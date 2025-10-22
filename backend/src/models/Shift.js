/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

const mongoose = require('mongoose');

const ShiftSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  corridor: String,
  start: Date,
  end: Date,
  status: { type: String, enum: ['scheduled', 'active', 'completed'], default: 'scheduled' },
});

module.exports = mongoose.model('Shift', ShiftSchema);
