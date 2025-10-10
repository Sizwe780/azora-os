// Compliance and Safety Reporting Service
// Incident reporting, training modules, immutable audit logs

class ComplianceService {
  constructor() {
    this.incidents = [];
    this.trainingRecords = [];
    this.auditLogs = [];
  }

  reportIncident({ reporter, type, description, corridor }) {
    const incident = { reporter, type, description, corridor, timestamp: Date.now() };
    this.incidents.push(incident);
    this.logAudit(incident);
    return incident;
  }

  getIncidents(corridor) {
    return this.incidents.filter(i => i.corridor === corridor);
  }

  recordTraining({ user, module, status }) {
    const record = { user, module, status, timestamp: Date.now() };
    this.trainingRecords.push(record);
    this.logAudit(record);
    return record;
  }

  getTrainingRecords(user) {
    return this.trainingRecords.filter(r => r.user === user);
  }

  logAudit(entry) {
    // Immutable audit log with blockchain anchoring
    this.auditLogs.push(entry);
    // For now, just print
    console.log('Audit log:', entry);
  }

  getAuditLogs() {
    return this.auditLogs;
  }
}

module.exports = new ComplianceService();
