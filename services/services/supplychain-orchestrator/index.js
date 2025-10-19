const express = require('express');
const app = express();
app.use(express.json());
app.post('/api/supplychain/status', (req, res) => res.json({ supplyId: 'SC'+Date.now(), status: 'in-transit' }));
app.listen(3072);
