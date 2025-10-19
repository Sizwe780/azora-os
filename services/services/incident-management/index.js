const express = require('express');
const app = express();
app.use(express.json());
app.post('/api/incident/report', (req, res) => res.json({ incidentId: Date.now(), status: 'open' }));
app.listen(3106);
