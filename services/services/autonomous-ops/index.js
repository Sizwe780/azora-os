const express = require('express');
const app = express();
app.use(express.json());
app.post('/api/ops/autonomous', (req, res) => res.json({ action: 'auto-remediation', result: 'success' }));
app.listen(3104);
