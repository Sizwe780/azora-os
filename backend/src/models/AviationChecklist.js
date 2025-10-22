/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

const mongoose = require('mongoose');

const AviationChecklistSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  corridor: { type: String, default: 'aviation' },
  steps: [{ step: String, completed: { type: Boolean, default: false }, timestamp: Date }],
  status: { type: String, default: 'in-progress', enum: ['in-progress', 'completed', 'failed'] },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('AviationChecklist', AviationChecklistSchema);
