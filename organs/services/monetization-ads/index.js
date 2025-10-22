/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

const express = require('express');
const app = express();
app.use(express.json());
app.post('/api/monetization/ad', (req, res) => res.json({ revenue: 10 }));
app.listen(3042);
