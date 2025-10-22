/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

const express = require('express');
const app = express();
app.use(express.json());

let providers = ["aws", "azure", "gcp"];
let deployments = [];

app.post('/api/multicloud/deploy', (req, res) => {
  const { provider, service, config } = req.body;
  if (!providers.includes(provider)) return res.status(400).json({ error: "invalid provider" });
  const id = "deploy_" + Math.random().toString(36).substr(2, 8);
  deployments.push({ id, provider, service, config, status: "in-progress", ts: Date.now() });
  res.json({ id, provider, service, status: "in-progress" });
});

app.get('/api/multicloud/status/:id', (req, res) => {
  const d = deployments.find(x => x.id === req.params.id);
  if (!d) return res.status(404).json({ error: "not found" });
  res.json(d);
});

app.get('/api/multicloud/providers', (_, res) => {
  res.json({ providers });
});

app.listen(6400, () => console.log("[multicloud] running on 6400"));
