const express = require('express');
const app = express();
app.use(express.json());
app.post('/api/monetization/ad', (req, res) => res.json({ revenue: 10 }));
app.listen(3042);
