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

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'analytics-real-time' }));

app.post('/api/analytics-real-time', (req, res) => {
  // TODO: Replace with real logic
  res.json({ service: 'analytics-real-time', ok: true, received: req.body });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 3032;
app.listen(PORT, () => console.log('[analytics-real-time] running on port', PORT));
