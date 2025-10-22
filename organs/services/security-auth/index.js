/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

const express = require('express');
const app = express();
app.use(express.json());
app.post('/api/security/auth', (req, res) => res.json({ token: 'jwt' }));
app.listen(3035);
