const express = require('express');
const app = express();
app.use(express.json());
app.post('/api/sensor/fuse', (req, res) => res.json({ fused: true, quality: 0.98 }));
app.listen(3077);
