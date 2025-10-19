const express = require('express');
const app = express();
app.use(express.json());

let events = [];

app.post('/api/analytics/event', (req, res) => {
  events.push({ ...req.body, ts: Date.now() });
  res.json({ success: true });
});

app.get('/api/analytics/funnel', (req, res) => {
  // Simple funnel: count events by type
  const funnel = events.reduce((f, e) => {
    f[e.type] = (f[e.type]||0)+1;
    return f;
  }, {});
  res.json({ funnel });
});

app.get('/api/analytics/heatmap', (req, res) => {
  // Example: aggregate clicks by (x,y)
  const heatmap = {};
  events.filter(e=>e.type==="click").forEach(e => {
    const key = `${e.x},${e.y}`;
    heatmap[key] = (heatmap[key]||0)+1;
  });
  res.json({ heatmap });
});

app.listen(3800, () => console.log("[analytics] running on 3800"));
// --- User Journey Endpoints ---
let sessions = {};

app.post('/api/analytics/session', (req, res) => {
  // Start or update user session
  const { userId, path } = req.body;
  if (!sessions[userId]) sessions[userId] = [];
  sessions[userId].push({ path, ts: Date.now() });
  res.json({ success: true });
});

app.get('/api/analytics/session/:userId', (req, res) => {
  res.json({ journey: sessions[req.params.userId]||[] });
});

app.get('/api/analytics/dropoffs', (req, res) => {
  // Naive dropoff: last page per user
  const dropoffs = Object.entries(sessions).map(([u, s]) => s[s.length-1]?.path);
  const stats = dropoffs.reduce((m, p) => { m[p] = (m[p]||0)+1; return m; }, {});
  res.json({ dropoffs: stats });
});
