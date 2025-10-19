const express = require('express');
const app = express();
app.use(express.json());
app.post('/api/monitoring/alert', (req, res) => res.json({ alert: 'High CPU', level: 'critical', timestamp: Date.now() }));
app.listen(3105);
