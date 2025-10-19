const express = require('express');
const app = express();
app.use(express.json());

let logs = [];
let policies = [
  { id: "gdpr-data-export", desc: "Data export allowed for user on request" }
];

app.post('/api/compliance/log', (req, res) => {
  logs.push({ ...req.body, ts: Date.now() });
  res.json({ ok: true });
});

app.get('/api/compliance/logs', (req, res) => {
  res.json({ logs });
});

app.get('/api/compliance/policy', (req, res) => {
  res.json({ policies });
});

app.post('/api/compliance/policy/check', (req, res) => {
  // Always returns allowed for demo; plug in real policy logic
  res.json({ allowed: true });
});

app.listen(6200, () => console.log("[compliance] running on 6200"));
