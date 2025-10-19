const express = require('express');
const app = express();
app.use(express.json());
app.post('/api/agritech/monitor', (req, res) => res.json({ soilMoisture: 0.41, cropHealth: 'good' }));
app.listen(3087);
