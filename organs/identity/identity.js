/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

const express = require('express');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
app.use(express.json());
app.use(cors());

let identities = {};

function generatePoC(identityData) {
  const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(JSON.stringify(identityData)));
  let tier = 'X';
  let riskScore = 100;
  if (identityData.verified && identityData.complianceSubmitted) {
    tier = 'A';
    riskScore = 10;
  } else if (identityData.verified) {
    tier = 'B';
    riskScore = 50;
  }
  return { hash, tier, riskScore };
}

app.post('/api/identity/onboard', (req, res) => {
  const { name, dob, idimagehash, biometricenrollmentblob, oath_signature } = req.body;
  const id = crypto.randomUUID();
  const poc = generatePoC({ name, dob, idimagehash, biometricenrollmentblob });
  identities[id] = {
    id,
    name,
    dob,
    idimagehash,
    biometricenrollmentblob,
    oath_signature,
    poc,
    verified: false,
    tier: poc.tier,
    riskScore: poc.riskScore
  };
  res.json({ identityid: id, pochash: poc.hash, idtoken: id, tierpending: poc.tier });
});

app.post('/api/identity/verify', (req, res) => {
  const { identityid, livenessblob, device_attestation } = req.body;
  const identity = identities[identityid];
  if (!identity) return res.status(404).json({ error: 'Identity not found' });
  identity.verified = true;
  identity.tier = 'A';
  identity.riskScore = 10;
  res.json({ verified: true, attestation_proof: 'proof' });
});

app.post('/api/compliance/submit', (req, res) => {
  const { identityid, doctype, dochash, redactedpayload_location } = req.body;
  const identity = identities[identityid];
  if (!identity) return res.status(404).json({ error: 'Identity not found' });
  identity.complianceSubmitted = true;
  const pocUpdate = generatePoC(identity);
  identity.poc = pocUpdate;
  res.json({ submissionid: crypto.randomUUID(), pochashupdate: pocUpdate.hash, riskscore: pocUpdate.riskScore });
});

app.get('/api/compliance/status/:identity_id', (req, res) => {
  const { identity_id } = req.params;
  const identity = identities[identity_id];
  if (!identity) return res.status(404).json({ error: 'Identity not found' });
  res.json({
    identityid: identity.id,
    tier: identity.tier,
    riskscore: identity.riskScore,
    limits: { daily: 100, weekly: 500 }
  });
});

const PORT = process.env.IDENTITY_PORT || 4097;
app.listen(PORT, () => console.log(`✅ Identity Service running on port ${PORT}`));
