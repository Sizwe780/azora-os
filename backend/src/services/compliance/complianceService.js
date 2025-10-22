/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

// Compliance and Safety Reporting Service
// Incident reporting, training modules, immutable audit logs
const Incident = require('../../models/Incident');
const AuditLog = require('../../models/AuditLog');
const TrainingRecord = require('../../models/TrainingRecord');

class ComplianceService {
  async reportIncident({ reporter, type, description, corridor }) {
    const payload = {
      userId: reporter,
      details: `${type}: ${description}`,
      corridor,
      status: 'reported',
    };

    const incident = await Incident.create(payload);
    await this.logAudit({
      userId: reporter,
      action: 'incident_reported',
      details: `${corridor} | ${type}`,
    });

    return incident.toObject();
  }

  async getIncidents(corridor) {
    const filter = corridor ? { corridor } : {};
    const incidents = await Incident.find(filter).sort({ timestamp: -1 }).lean();
    return incidents;
  }

  async recordTraining({ user, module, status, corridor }) {
    const record = await TrainingRecord.create({ user, module, status, corridor });
    await this.logAudit({
      userId: user,
      action: 'training_recorded',
      details: `${module} -> ${status}`,
    });
    return record.toObject();
  }

  async getTrainingRecords(user) {
    const filter = user ? { user } : {};
    const records = await TrainingRecord.find(filter).sort({ createdAt: -1 }).lean();
    return records;
  }

  async logAudit(entry) {
    await AuditLog.create({
      userId: entry.userId || null,
      action: entry.action,
      details: entry.details,
    });
  }

  async getAuditLogs() {
    const logs = await AuditLog.find().sort({ timestamp: -1 }).lean();
    return logs;
  }
}

module.exports = new ComplianceService();
