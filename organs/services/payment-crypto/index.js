const express = require('express');
const app = express();
app.use(express.json());
app.post('/api/payment/crypto', (req, res) => res.json({ tx: 'confirmed' }));
app.listen(3045);
