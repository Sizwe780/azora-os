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

let guardians = {};
let recoveries = {};

app.post('/api/guardian/register', (req, res) => {
  const { identityid, guardianid } = req.body;
  if (!guardians[identityid]) guardians[identityid] = [];
  guardians[identityid].push(guardianid);
  res.json({ success: true });
});

app.post('/api/wallet/recover/initiate', (req, res) => {
  const { identityid, reportreason, device_info } = req.body;
  const token = crypto.randomUUID();
  recoveries[token] = {
    identityid,
    reportreason,
    device_info,
    attestations: [],
    required: 3,
    coolingPeriod: 3600
  };
  res.json({ recoverytoken: token, requiredattestations: 3, coolingperiodseconds: 3600 });
});

app.post('/api/recover/attest', (req, res) => {
  const { recoverytoken, guardianid, attestation_blob } = req.body;
  const recovery = recoveries[recoverytoken];
  if (!recovery) return res.status(404).json({ error: 'Recovery not found' });
  recovery.attestations.push({ guardianid, attestation_blob, timestamp: new Date() });
  if (recovery.attestations.length >= recovery.required) {
    console.log('Recovery approved for', recovery.identityid);
  }
  res.json({ attestationid: crypto.randomUUID(), attestationtimestamp: new Date() });
});

const PORT = process.env.GUARDIAN_PORT || 4098;
app.listen(PORT, () => console.log(`✅ Guardian Service running on port ${PORT}`));
