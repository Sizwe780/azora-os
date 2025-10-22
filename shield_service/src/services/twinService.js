/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const kyber = require('node-pqcrypto/kyber');
const dilithium = require('node-pqcrypto/dilithium');
const config = require('../config');

// In-memory store for demo purposes. Replace with a secure database in production.
const twinStore = new Map();

class OntologicalTwinShield {
  constructor(userId, corridor) {
    this.id = uuidv4();
    this.userId = userId;
    this.corridor = corridor;
    this.state = { embeddingHandle: null, anchors: [] };
    this.sigKeys = dilithium.keyPair();   // For authentication/signatures
    this.kemKeys = kyber.keyPair();       // For confidentiality/encryption
  }

  async sign(action) {
    const msg = Buffer.from(`${this.id}:${this.userId}:${this.corridor}:${action}:${Date.now()}`);
    const sig = dilithium.sign(msg, this.sigKeys.secretKey);
    return { signature: Buffer.from(sig).toString('base64'), message: msg.toString() };
  }
}

const spawnTwin = (userId, corridor) => {
  if (!userId || !corridor) {
    throw new Error('User ID and corridor are required');
  }
  const twin = new OntologicalTwinShield(userId, corridor);
  twin.state.anchors.push({ t0: Date.now(), event: 'spawn' });
  twinStore.set(twin.id, twin);
  console.log(`Spawned twin ${twin.id} for user ${userId}`);
  return twin;
};

const getTwin = (twinId) => {
  const twin = twinStore.get(twinId);
  if (!twin) {
    throw new Error('Twin not found');
  }
  return twin;
};

const processFeatures = async (twinId, features) => {
    const twin = getTwin(twinId);
    // 1. Get quantum signal by submitting a circuit
    const circuitRes = await axios.post(`${config.quantumService.url}/submit_circuit`, {
      name: 'risk_ising',
      params: { num_qubits: 8, reps: 2 } // These params could be corridor-specific
    });
    twin.state.embeddingHandle = circuitRes.data.provenance;
    // Here, the quantum result would be processed into a signal. For the stub, we'll use a placeholder.
    const quantumScore = Math.random() * 0.2 + 0.1; // Placeholder for real quantum processing
    // 2. Run the hybrid simulation
    const simRes = await axios.post(`${config.quantumService.url}/simulate`, {
      features: {
        classical_anomaly: features.classicalScore,
        quantum_signal: quantumScore
      }
    });
    return { simulationResult: simRes.data, twinState: twin.state };
};

module.exports = { spawnTwin, getTwin, processFeatures };
