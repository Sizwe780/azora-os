/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

const express = require('express');
const app = express();
app.use(express.json());

app.post('/api/compliance/check', (req, res) => {
  const { action } = req.body;
  res.json({ compliant: true, action, risk: 'low' });
});

const PORT = 4120;
app.listen(PORT, () => console.log(`📋 Compliance Service running on port ${PORT}`));
