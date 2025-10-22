/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

const express = require('express');
const saLaws = require('./sa-legal-frameworks');
const app = express();
const PORT = 4036;
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));
app.get('/api/v1/frameworks', (req, res) => res.status(200).json(saLaws));
app.listen(PORT, () => console.log(`SA Compliance service running on port ${PORT}`));
