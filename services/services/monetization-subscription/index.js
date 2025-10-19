const express = require('express');
const app = express();
app.use(express.json());
app.post('/api/monetization/subscribe', (req, res) => res.json({ plan: 'premium' }));
app.listen(3040);
