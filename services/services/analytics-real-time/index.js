const express = require('express');
const app = express();
app.use(express.json());
app.post('/api/analytics/realtime', (req, res) => res.json({ users: 120, active: 100 }));
app.listen(3055);
