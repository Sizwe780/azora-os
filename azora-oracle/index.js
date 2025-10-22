/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

const express = require('express');
const app = express();
app.use(express.json());

let twins = {};

app.post('/api/twin/:id', (req, res) => {
  twins[req.params.id] = req.body.state;
  res.json({ ok: true, id: req.params.id, state: twins[req.params.id] });
});

app.get('/api/twin/:id', (req, res) => {
  res.json({ state: twins[req.params.id] });
});

app.get('/api/twin', (req, res) => {
  res.json({ twins });
});

app.listen(5800, () => console.log("[digital-twin] running on 5800"));
