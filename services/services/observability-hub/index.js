const express = require('express');
const app = express();
app.use(express.json());
app.post('/api/observability/metrics', (req, res) => res.json({ uptime: 99.99, errors: 0 }));
app.listen(3101);
