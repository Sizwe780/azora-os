/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'climate-prediction' }));

app.post('/api/climate-prediction', (req, res) => {
  // TODO: Replace with real logic
  res.json({ service: 'climate-prediction', ok: true, received: req.body });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 3056;
app.listen(PORT, () => console.log('[climate-prediction] running on port', PORT));
