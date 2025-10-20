const express = require('express');
const app = express();
app.use(express.json());
app.post('/api/quantum/superpose', (req, res) => res.json({ superposed: true }));
app.listen(3024);
