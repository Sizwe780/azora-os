/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

const express = require('express');
const crypto = require('crypto');
const app = express();
app.use(express.json());

let assets = {};
let ownership = {};

function assetId() { return "asset_" + crypto.randomBytes(8).toString('hex'); }

app.post('/api/asset/register', (req, res) => {
  const { owner, meta } = req.body;
  const id = assetId();
  assets[id] = { meta, id };
  ownership[id] = owner;
  res.json({ id, meta, owner });
});

app.get('/api/asset/:id', (req, res) => {
  if (!assets[req.params.id]) return res.status(404).json({ error: "not found" });
  res.json({ id: req.params.id, meta: assets[req.params.id].meta, owner: ownership[req.params.id] });
});

app.post('/api/asset/transfer', (req, res) => {
  const { id, to } = req.body;
  if (!ownership[id]) return res.status(404).json({ error: "asset not found" });
  ownership[id] = to;
  res.json({ id, newOwner: to });
});

app.get('/api/asset', (_, res) => {
  res.json({ assets: Object.keys(assets).map(id => ({ ...assets[id], owner: ownership[id] })) });
});

app.listen(6100, () => console.log("[digital-asset] running on 6100"));
