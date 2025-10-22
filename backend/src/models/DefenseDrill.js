/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

const mongoose = require('mongoose');

const DefenseDrillSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  corridor: { type: String, default: 'defense' },
  drillType: { type: String, required: true },
  status: { type: String, default: 'alerted', enum: ['alerted', 'in-progress', 'completed'] },
  participants: [{ userId: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('DefenseDrill', DefenseDrillSchema);
