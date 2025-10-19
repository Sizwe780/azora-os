const express = require('express');
const app = express();
app.use(express.json());
app.post('/api/iot/telemetry', (req, res) => res.json({ status: 'ok', metrics: { temp: 21 } }));
app.listen(3057);
