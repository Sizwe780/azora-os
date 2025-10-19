const express = require('express');
const app = express();
app.use(express.json());
app.post('/api/payment/stripe', (req, res) => res.json({ paid: true }));
app.listen(3041);
