/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import express from 'express';
import cors from 'cors';
import notificationApi from './notificationApi';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', notificationApi);

app.get('/health', (req, res) => res.status(200).json({ status: 'online' }));

const PORT = process.env.PORT || 5300;
app.listen(PORT, () => {
  console.log(`📣 Notification Service is online on port ${PORT}.`);
});