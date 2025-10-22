/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

const express = require('express');
const app = express();
app.use(express.json());

let registry = {};

app.post('/register', (req, res) => {
  const { name, url } = req.body;
  registry[name] = { url, timestamp: Date.now() };
  res.json({ registered: true, name, url });
});

app.get('/services', (req, res) => {
  res.json(Object.entries(registry).map(([name, data]) => ({ name, ...data })));
});

app.listen(3200, () => console.log('[service-registry] running on port 3200'));
