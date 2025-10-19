const express = require('express');
const app = express();
app.use(express.json());

let nodes = {};
let tasks = [];

app.post('/api/edge/register', (req, res) => {
  const { nodeId, meta } = req.body;
  nodes[nodeId] = { ...meta, nodeId, lastSeen: Date.now() };
  res.json({ ok: true });
});

app.post('/api/edge/task', (req, res) => {
  const { nodeId, task } = req.body;
  tasks.push({ nodeId, task, status: "queued", ts: Date.now() });
  res.json({ ok: true });
});

app.get('/api/edge/tasks/:nodeId', (req, res) => {
  res.json({ tasks: tasks.filter(t=>t.nodeId===req.params.nodeId) });
});

app.listen(5400, () => console.log("[edge-orchestrator] running on 5400"));
