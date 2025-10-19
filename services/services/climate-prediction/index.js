const express = require('express');
const app = express();
app.use(express.json());
app.post('/api/climate/predict', (req, res) => res.json({ forecast: 'rain', temperature: 17 }));
app.listen(3086);
