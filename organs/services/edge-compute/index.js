const express = require('express');
const app = express();
app.use(express.json());
app.post('/api/edge/process', (req, res) => res.json({ result: 'processed at edge', latencyMs: 15 }));
app.listen(3053);
