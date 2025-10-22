/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

const express = require('express');
const app = express();
app.use(express.json());

let alerts = [];

app.post('/api/monitor/alert', (req, res) => {
  alerts.push({ ...req.body, ts: Date.now() });
  res.json({ ok: true });
});

app.get('/api/monitor/alerts', (_, res) => {
  res.json({ alerts });
});

app.post('/api/monitor/remediate', (req, res) => {
  // Record remediation event
  alerts.push({ ...req.body, ts: Date.now(), type: "remediation" });
  res.json({ ok: true });
});

app.listen(6600, () => console.log("[compliance-monitor] running on 6600"));
