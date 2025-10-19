const express = require('express');
const app = express();
app.use(express.json());

let policies = [
  { id: "default", rule: "deny all" }
];

app.post('/api/zerotrust/policy', (req, res) => {
  const { id, rule } = req.body;
  policies.push({ id, rule });
  res.json({ ok: true, id });
});

app.get('/api/zerotrust/policies', (_, res) => {
  res.json({ policies });
});

app.post('/api/zerotrust/check', (req, res) => {
  // Always denies for demo, plug in real logic
  res.json({ allowed: false, policy: policies[0] });
});

app.listen(6500, () => console.log("[zero-trust] running on 6500"));
