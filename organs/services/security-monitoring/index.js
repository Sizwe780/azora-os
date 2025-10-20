const express = require('express');
const app = express();
app.use(express.json());
app.post('/api/security/monitor', (req, res) => res.json({ threats: 0 }));
app.listen(3037);
