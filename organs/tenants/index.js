/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

const express = require('express');
const app = express();
app.use(express.json());

let tenants = {};

app.post('/api/tenants', (req, res) => {
  const { name } = req.body;
  const id = "tenant-" + Math.random().toString(36).substr(2, 8);
  tenants[id] = { name, id };
  res.json({ id, name });
});

app.get('/api/tenants', (_,res) => res.json({ tenants: Object.values(tenants) }));

app.listen(4900, () => console.log("[tenants] running on 4900"));
