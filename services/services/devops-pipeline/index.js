const express = require('express');
const app = express();
app.use(express.json());
app.post('/api/devops/deploy', (req, res) => res.json({ deployed: true, version: req.body.version || 'latest' }));
app.listen(3100);
