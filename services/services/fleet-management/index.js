const express = require('express');
const app = express();
app.use(express.json());
app.post('/api/fleet/track', (req, res) => res.json({ fleetId: req.body.fleetId, position: [26.2,28.1] }));
app.listen(3073);
