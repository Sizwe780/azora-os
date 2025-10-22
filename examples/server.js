/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * Azora OS - 0 Million Blockchain System
 * 
 * This server combines all components:
 * - Blockchain node with adaptive complexity
 * - Founder withdrawal system (40% personal, 60% reinvestment)
 * - Competitive analysis showing why Azora OS is worth 0M
 * - Constitutional compliance enforcement
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;
const morgan = require('morgan');
const bodyParser = require('body-parser');

// Import routes
const blockchainWithdrawalRouter = require('./services/founder-withdrawal/blockchain-withdrawals');
const competitiveAnalysisRouter = require('./services/valuation-service/competitive-analysis');

// Create express app
const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(bodyParser.json());

// Static files
app.use(express.static(path.join(__dirname, 'services/blockchain-node/public')));

// Mount routes
app.use('/api', blockchainWithdrawalRouter);
app.use('/competitive', competitiveAnalysisRouter);

// Redirect root to blockchain explorer
app.get('/', (req, res) => {
  res.redirect('/index.html');
});

// Start server
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`Azora OS Blockchain running on port ${PORT}`);
  console.log('0 million valuation system initialized');
  console.log('40/60 constitutional withdrawal system active');
});
