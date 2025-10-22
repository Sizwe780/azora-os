/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * Azora OS Subscription Service Server
 * Handles trial management, promotional pricing, and billing
 */

const express = require('express');
const cors = require('cors');
const subscriptionRoutes = require('./index');

const app = express();
const PORT = process.env.PORT || 3006;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/v1/subscription', subscriptionRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    service: 'Subscription Service',
    status: 'operational',
    version: '1.0.0',
    trialOffer: '1 month free, then 50% off for 2 months'
  });
});

// Start server
app.listen(PORT, () => {
  console.log('');
  console.log('💰 Subscription Service');
  console.log('========================');
  console.log(`Port: ${PORT}`);
  console.log('Status: Online');
  console.log('');
  console.log('Features:');
  console.log('  ✅ 1-month free trial');
  console.log('  ✅ 50% off for 2 months after trial');
  console.log('  ✅ Automatic phase transitions');
  console.log('  ✅ Promotional notifications');
  console.log('  ✅ Flexible pricing tiers');
  console.log('');
  console.log('🇿🇦 Built by Sizwe Ngwenya for Azora World');
  console.log('Making subscriptions simple and profitable!');
  console.log('');
});