/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import express from 'express';
import kycAmlApi from './kycAmlApi';

const app = express();
app.use(express.json());
app.use('/api', kycAmlApi);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`KYC AML Service running on port ${PORT}`);
});