/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

const express = require('express');
const app = express();
app.use(express.json());
app.post('/api/edge/process', (req, res) => res.json({ result: 'processed at edge', latencyMs: 15 }));
app.listen(3053);
