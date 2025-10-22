/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import express from 'express';
import complianceApi from './complianceApi';

const app = express();
app.use(express.json());
app.use('/api/compliance', complianceApi);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 4120;
app.listen(PORT, () => {
  console.log(`📋 Advanced Compliance Service running on port ${PORT}`);
});