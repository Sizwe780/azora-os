const express = require('express');
const app = express();
app.use(express.json());
app.post('/api/blockchain/layer2', (req, res) => res.json({ tx: 'fast' }));
app.listen(3021);
