/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

const mongoose = require('mongoose');

const ReputationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  score: { type: Number, default: 0 },
  history: [{ delta: Number, reason: String, timestamp: Date }],
});

module.exports = mongoose.model('Reputation', ReputationSchema);
