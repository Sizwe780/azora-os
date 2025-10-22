/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

const express = require('express');
const app = express();
app.use(express.json());

let messages = [];

app.post('/api/messages', (req, res) => {
  const { from, to, text } = req.body;
  messages.push({ from, to, text, ts: Date.now() });
  res.json({ success: true });
});

app.get('/api/messages/:user', (req, res) => {
  const user = req.params.user;
  const inbox = messages.filter(m => m.to === user || m.from === user);
  res.json({ messages: inbox });
});

app.listen(4200, () => console.log("[messaging] running on 4200"));
