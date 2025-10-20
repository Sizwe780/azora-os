const express = require('express');
const app = express();
app.use(express.json());
app.post('/api/quantum/entangle', (req, res) => res.json({ entangled: true }));
app.listen(3022);
