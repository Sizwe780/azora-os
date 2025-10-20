const express = require('express');
const app = express();
app.use(express.json());
app.post('/api/blockchain/oracle', (req, res) => res.json({ data: 'external' }));
app.listen(3027);
