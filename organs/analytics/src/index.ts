/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import express from 'express';
import analyticsApi from './analyticsApi';

const app = express();
app.use(express.json());
app.use('/api/analytics', analyticsApi);

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'analytics' }));

const PORT = process.env.PORT || 3800;
app.listen(PORT, () => {
  console.log(`📊 Analytics Service running on port ${PORT}`);
});