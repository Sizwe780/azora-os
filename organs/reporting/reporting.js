/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const transparencyData = {
  founding_ledger: { receipts: [] },
  pocstats: { tierA: 100, tierB: 50, mintedToday: 1000 },
  incident: { latest: 'No incidents' }
};

app.get('/api/transparency/founding_ledger', (req, res) => {
  res.json(transparencyData.founding_ledger);
});

app.get('/api/transparency/pocstats', (req, res) => {
  res.json(transparencyData.pocstats);
});

app.get('/api/transparency/incident/latest', (req, res) => {
  res.json({ note: transparencyData.incident.latest });
});

app.get('/api/reporting/foundersales', (req, res) => {
  res.json({ coinssold: 50000, fundsreceivedhash: '0xhash', signedreceipt: 'signature' });
});

const PORT = process.env.REPORTING_PORT || 4101;
app.listen(PORT, () => console.log(`✅ Reporting Service running on port ${PORT}`));
