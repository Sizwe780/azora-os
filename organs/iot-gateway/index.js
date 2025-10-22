/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

const express = require('express');
const app = express();
app.use(express.json());

let devices = {};

app.post('/api/iot/register', (req,res) => {
  const { deviceId, meta } = req.body;
  devices[deviceId] = { ...meta, status: "online" };
  res.json({ ok: true });
});

app.post('/api/iot/data', (req,res) => {
  const { deviceId, data } = req.body;
  if (!devices[deviceId]) return res.status(404).json({ error: "Device not registered" });
  devices[deviceId].lastData = data;
  res.json({ ok: true });
});

app.post('/api/iot/command', (req,res) => {
  const { deviceId, command } = req.body;
  // Simulate command send
  res.json({ ok: true, result: `Command '${command}' sent to ${deviceId}` });
});

app.get('/api/iot/devices', (_,res) => {
  res.json({ devices });
});

app.listen(4600, () => console.log("[iot-gateway] running on 4600"));
