/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('Azora OS UI'));
app.listen(3000, () => console.log('UI running on 3000'));
app.get('/onboarding', (req, res) => res.send('Onboarding Wizard'));
app.get('/feedback', (req, res) => res.send('Feedback Panel'));
app.get('/analytics', (req, res) => res.send('Analytics Dashboard'));
