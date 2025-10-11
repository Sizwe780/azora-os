const kyber = require('node-pqcrypto/kyber');
const dilithium = require('node-pqcrypto/dilithium');
const axios = require('axios');
const { Buffer } = require('node:buffer');
const config = require('../config');

class OntologicalTwinShield {
  constructor(userId, corridor) {
    this.userId = userId;
    this.corridor = corridor;
    this.state = { embeddingHandle: null, anchors: [] };
    this.sigKeys = dilithium.keyPair();   // auth
    this.kemKeys = kyber.keyPair();       // confidentiality
  }

  async spawn() {
    const anchor = { t0: Date.now(), ttlMs: 48*60*60*1000 };
    this.state.anchors.push(anchor);
    return this.sign('spawn');
  }

  async embed(features) {
    const featureVector = Array.isArray(features?.vector) ? features.vector : [];
    const numQubits = Math.max(4, featureVector.length || 8);
    const reps = Math.max(1, Math.min(4, Math.round(numQubits / 4)));

    const res = await axios.post(`${config.quantum.url}/submit_circuit`, {
      name: 'risk_ising',
      params: { num_qubits: numQubits, reps, payload: featureVector }
    });
    this.state.embeddingHandle = res.data.provenance;
    return res.data.embedding;
  }

  async predict(features) {
    const res = await axios.post(`${config.quantum.url}/simulate`, {
      features: {
        classical_anomaly: features.classicalScore,
        quantum_signal: features.quantumScore
      }
    });
    return res.data;
  }

  async sign(action) {
    const msg = Buffer.from(`${this.userId}:${this.corridor}:${action}`);
    const sig = dilithium.sign(msg, this.sigKeys.secretKey);
    return { dilithium: Buffer.from(sig).toString('base64') };
  }
}

module.exports = { OntologicalTwinShield };
