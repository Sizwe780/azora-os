const express = require('express');
const app = express();
app.use(express.json());
app.post('/api/monetization/fee', (req, res) => res.json({ collected: 1 }));
app.listen(3046);
