const express = require('express');
const app = express();
app.use(express.json());
app.post('/api/config/update', (req, res) => res.json({ config: req.body.key, value: req.body.value, updated: true }));
app.listen(3107);
