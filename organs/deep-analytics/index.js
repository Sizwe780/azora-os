/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

const express = require('express');
const app = express();
app.use(express.json());

let events = [];

app.post('/api/deep-analytics/event', (req, res) => {
  events.push({ ...req.body, ts: Date.now() });
  // TODO: Forward to BigQuery/Snowflake, etc.
  res.json({ ok: true });
});

app.get('/api/deep-analytics/events', (req, res) => {
  res.json({ events });
});

app.listen(5300, () => console.log("[deep-analytics] running on 5300"));
