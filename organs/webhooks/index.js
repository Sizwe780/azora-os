/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

const express = require('express');
const app = express();
app.use(express.json());

let subscriptions = {};

app.post('/api/webhooks/subscribe', (req, res) => {
  const { event, url } = req.body;
  if (!subscriptions[event]) subscriptions[event] = [];
  subscriptions[event].push(url);
  res.json({ ok: true });
});

app.post('/api/webhooks/trigger', (req, res) => {
  const { event, payload } = req.body;
  (subscriptions[event]||[]).forEach(url => {
    fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
  });
  res.json({ ok: true, delivered: subscriptions[event]?.length || 0 });
});

app.listen(4300, () => console.log("[webhooks] running on 4300"));
