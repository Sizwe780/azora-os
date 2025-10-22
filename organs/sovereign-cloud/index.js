/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

const express = require('express');
const app = express();
app.use(express.json());

let regions = ["eu-west", "us-east", "za-north"];
let residency = {};

app.post('/api/sovereign-cloud/assign', (req, res) => {
  const { user, region } = req.body;
  if (!regions.includes(region)) return res.status(400).json({ error: "invalid region" });
  residency[user] = region;
  res.json({ user, region });
});

app.get('/api/sovereign-cloud/region/:user', (req, res) => {
  res.json({ user: req.params.user, region: residency[req.params.user] });
});

app.get('/api/sovereign-cloud/regions', (_, res) => {
  res.json({ regions });
});

app.listen(6300, () => console.log("[sovereign-cloud] running on 6300"));
