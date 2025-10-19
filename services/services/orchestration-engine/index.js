const express = require('express');
const app = express();
app.use(express.json());
app.post('/api/orchestrate/run', (req, res) => res.json({ workflow: req.body.workflow || 'default', status: 'started' }));
app.listen(3102);
