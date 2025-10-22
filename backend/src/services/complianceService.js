/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

// Compliance logic for checklists, incidents, and reporting
const AviationChecklist = require('../models/AviationChecklist');
const DefenseDrill = require('../models/DefenseDrill');
const Incident = require('../models/Incident');
const AuditLog = require('../models/AuditLog');

async function logChecklistCompletion(userId, checklistId, corridor) {
  const Model = corridor === 'defense' ? DefenseDrill : AviationChecklist;
  const checklist = await Model.findOne({ _id: checklistId, userId });

  if (!checklist) {
    throw new Error(`Checklist ${checklistId} not found for user ${userId}`);
  }

  checklist.status = 'completed';
  checklist.timestamp = new Date();
  await checklist.save();

  const audit = await AuditLog.create({
    userId,
    action: 'checklist_completed',
    details: `${corridor} checklist ${checklistId} marked complete`,
  });

  return {
    checklist: checklist.toObject(),
    audit: audit.toObject(),
  };
}

async function reportIncident(userId, details, corridor) {
  const incident = await Incident.create({
    userId,
    details,
    corridor,
  });

  await AuditLog.create({
    userId,
    action: 'incident_reported',
    details: `${corridor} incident: ${details}`,
  });

  return incident.toObject();
}

module.exports = { logChecklistCompletion, reportIncident };
