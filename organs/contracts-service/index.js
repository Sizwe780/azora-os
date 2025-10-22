/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * @file index.js
 * @author Sizwe Ngwenya
 * @description Manages the lifecycle of constitutionally compliant founder contracts.
 */
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.CONTRACTS_PORT || 4400;
const VERIFICATION_API = 'http://localhost:4410/api/sign';

// In-memory store for contract status
const contractLedger = {
  'sizwe_ngwenya': { signed: false, documentId: 'AZORA-FOUNDER-AGMT-SNGWENYA-V1' }
};

app.get('/health', (req, res) => res.status(200).json({ status: 'online' }));

app.get('/api/status/:founderId', (req, res) => {
  const { founderId } = req.params;
  const contract = contractLedger[founderId];
  if (contract) {
    res.json(contract);
  } else {
    res.status(404).json({ signed: false, error: 'Contract not found.' });
  }
});

app.post('/api/sign/:founderId', async (req, res) => {
  const { founderId } = req.params;
  const contract = contractLedger[founderId];
  if (!contract) return res.status(404).json({ error: 'Contract not found.' });
  if (contract.signed) return res.status(400).json({ error: 'Contract already signed.' });

  try {
    const verificationRes = await fetch(VERIFICATION_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentId: contract.documentId, signerId: founderId })
    });
    const verificationData = await verificationRes.json();

    contract.signed = true;
    contract.signature = verificationData.signature;
    contract.signedAt = new Date().toISOString();

    console.log(`CONTRACT SIGNED: ${founderId} signed ${contract.documentId} with signature ${verificationData.signature}`);
    res.status(200).json(contract);
  } catch (error) {
    res.status(500).json({ error: 'Failed to verify signature.' });
  }
});

app.listen(PORT, () => {
  console.log(`📜 Contracts Service is online on port ${PORT}`);
});
