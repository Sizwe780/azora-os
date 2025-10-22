/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

const express = require('express');
const app = express();
app.use(express.json());

let profiles = {};

app.post('/api/personalize', (req, res) => {
  const { userId, preferences } = req.body;
  profiles[userId] = { ...(profiles[userId]||{}), ...preferences };
  res.json({ ok: true, profile: profiles[userId] });
});

app.get('/api/personalize/:userId', (req, res) => {
  res.json({ profile: profiles[req.params.userId] || {} });
});

app.listen(4100, () => console.log("[personalization] running on 4100"));
