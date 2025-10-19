const express = require('express');
const app = express();
app.use(express.json());
app.post('/api/sustainability/track', (req, res) => res.json({ emissionsSaved: 42, waterUsage: 12 }));
app.listen(3080);
