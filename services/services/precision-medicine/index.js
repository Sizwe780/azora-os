const express = require('express');
const app = express();
app.use(express.json());
app.post('/api/medicine/personalize', (req, res) => res.json({ therapy: 'custom', efficacy: 0.93 }));
app.listen(3084);
