const express = require('express');
const app = express();
app.use(express.json());
app.post('/api/blockchain/dao', (req, res) => res.json({ vote: 'passed' }));
app.listen(3029);
