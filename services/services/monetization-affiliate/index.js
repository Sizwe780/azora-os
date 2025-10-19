const express = require('express');
const app = express();
app.use(express.json());
app.post('/api/monetization/affiliate', (req, res) => res.json({ commission: 5 }));
app.listen(3044);
