/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

const express = require('express');
const app = express();
app.use(express.json());
app.post('/api/iot/telemetry', (req, res) => res.json({ status: 'ok', metrics: { temp: 21 } }));
app.listen(3057);
