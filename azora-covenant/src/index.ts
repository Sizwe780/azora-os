/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import express from 'express';
import cors from 'cors';
import ledgerApi from './ledgerApi';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/ledger', ledgerApi);

app.get('/health', (req, res) => res.status(200).json({ status: 'online', service: 'ledger' }));

const PORT = process.env.PORT || 4099;
app.listen(PORT, () => {
  console.log(`✅ Ledger Service running on port ${PORT}`);
});