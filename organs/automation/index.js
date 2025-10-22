/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

const express = require('express');
const app = express();
app.use(express.json());

let workflows = {};

app.post('/api/automation/workflow', (req, res) => {
  const { id, triggers, actions } = req.body;
  workflows[id] = { triggers, actions };
  res.json({ ok: true, id });
});

app.post('/api/automation/trigger/:id', (req, res) => {
  const wf = workflows[req.params.id];
  if (!wf) return res.status(404).json({ error: "workflow not found" });
  // Execute actions (here: log; in prod: real action plugins)
  for (const a of wf.actions) { console.log(`[AUTOMATION] ${a.type}: ${JSON.stringify(a.params)}`); }
  res.json({ ok: true });
});

app.get('/api/automation/workflow/:id', (req, res) => {
  res.json(workflows[req.params.id] || {});
});

app.listen(5900, () => console.log("[automation] running on 5900"));
