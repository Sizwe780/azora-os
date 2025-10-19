const express = require('express');
const app = express();
app.use(express.json());
app.post('/api/iot/device', (req, res) => res.json({ registered: true, deviceId: 'iot-' + Date.now() }));
app.listen(3052);
