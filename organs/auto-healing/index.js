/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

const express = require('express');
const app = express();
app.get('/health', (req, res) => res.json({ status: 'healthy' }));
app.listen(6000, () => console.log('✅ Auto-healing on 6000'));
