/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

const { EventEmitter } = require('events');
const { runAllAIs } = require('./index');
const dilithium = require('node-pqcrypto/dilithium');
const kyber = require('node-pqcrypto/kyber');

// In-memory registry for demo. In production, use a distributed DB.
const meshRegistry = new Map();

class MeshNode extends EventEmitter {
  constructor(id, type, ownerId) {
    super();
    this.id = id;
    this.type = type; // 'corridor', 'device', 'employee'
    this.ownerId = ownerId;
    
    // Sovereign Identity & Post-Quantum Security
    this.sigKeys = dilithium.keyPair(); // For signing actions & attestations
    this.kemKeys = kyber.keyPair();     // For encrypting personal models & data

    // Personalized AI & State
    this.models = new Map(); // Stores personalized instances of AI models
    this.reputation = 100;   // Starting reputation score
    this.consent = {
      federatedLearning: true,
      dataContribution: true,
    };

    // Immutable, explainable audit log
    this.auditLog = [];
    
    this.log('info', `Node ${this.id} spawned for ${this.ownerId}.`);
  }

  log(level, message, data = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...data,
    };
    this.auditLog.push(logEntry);
    this.emit('log', logEntry); // For real-time monitoring
  }

  async runAI(context) {
    if (!this.consent.dataContribution) {
      this.log('warn', 'AI run skipped due to consent opt-out.');
      return { error: 'opted_out_of_data_contribution' };
    }

    // Enrich context with node's own identity
    const enrichedContext = { ...context, nodeId: this.id, ownerId: this.ownerId };
    
    const { intent, anomaly, quantum, insight } = await runAllAIs(enrichedContext);

    // Create an explainable, auditable result
    const explanation = `AI analysis complete. Intent '${intent}' detected with anomaly score ${anomaly.anomalyScore.toFixed(3)}. Quantum simulation yielded confidence of ${quantum.confidence?.toFixed(3)}. Insight: ${insight.summary}`;
    
    const result = { intent, anomaly, quantum, insight, explanation };
    
    this.log('info', 'AI analysis performed.', { result });
    this.emit('insight', { nodeId: this.id, result });

    // Reward for data contribution
    this.earnReputation(1, 'data_contribution');

    return result;
  }

  earnReputation(amount, reason) {
    this.reputation += amount;
    this.log('info', `Reputation changed by ${amount} for ${reason}. New score: ${this.reputation}`);
    this.emit('reputation', { nodeId: this.id, newScore: this.reputation, reason });
  }

  // Fine-tunes a model based on personal feedback (stub)
  trainModel(modelName, _feedback) {
    this.log('info', `Training model '${modelName}' with new feedback.`);
    // In a real implementation, this would trigger a federated learning job
    // For now, we'll just log it and reward the user.
    this.earnReputation(5, `model_feedback_${modelName}`);
    this.emit('model_trained', { nodeId: this.id, modelName });
  }

  // Opt-in/out of data sharing programs
  setConsent(consentFlags) {
    this.consent = { ...this.consent, ...consentFlags };
    this.log('info', 'Consent settings updated.', { newConsent: this.consent });
  }

  signState() {
    const stateHash = Buffer.from(JSON.stringify({ id: this.id, reputation: this.reputation, logCount: this.auditLog.length }));
    const signature = dilithium.sign(stateHash, this.sigKeys.secretKey);
    return { stateHash: stateHash.toString('hex'), signature: signature.toString('base64') };
  }
}

function spawnNode(id, type, ownerId) {
  if (meshRegistry.has(id)) {
    return meshRegistry.get(id);
  }
  const node = new MeshNode(id, type, ownerId);
  meshRegistry.set(id, node);
  return node;
}

function getNode(id) {
  const node = meshRegistry.get(id);
  if (!node) throw new Error(`Mesh node with id ${id} not found.`);
  return node;
}

// Example of how the mesh can interact
async function runFederatedAnalysis(employeeId, deviceId, corridorId, context) {
  const employeeNode = getNode(employeeId);
  const deviceNode = getNode(deviceId);
  const corridorNode = getNode(corridorId);

  // Run AI on the employee's personal node
  const result = await employeeNode.runAI(context);

  // Log the event at the device and corridor level for broader context
  deviceNode.log('info', `Federated analysis event for employee ${employeeId}.`, { result });
  corridorNode.log('info', `Corridor-level event for employee ${employeeId}.`, { result });

  return result;
}

module.exports = { spawnNode, getNode, runFederatedAnalysis, meshRegistry };
