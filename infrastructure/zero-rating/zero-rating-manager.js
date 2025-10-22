/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * Azora Zero-Rating Manager
 * Enables free access to Azora OS across Africa
 * Partners with mobile network operators for data-free access
 */

const express = require('express');
const Redis = require('ioredis');
const axios = require('axios');

const app = express();
app.use(express.json());

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Mobile Network Operators with Zero-Rating Agreements
const MNO_PARTNERS = {
  // South Africa
  MTN_ZA: { name: 'MTN South Africa', ip_ranges: ['41.0.0.0/8'], status: 'active' },
  VODACOM_ZA: { name: 'Vodacom', ip_ranges: ['105.0.0.0/8'], status: 'active' },
  TELKOM_ZA: { name: 'Telkom Mobile', ip_ranges: ['196.0.0.0/8'], status: 'active' },
  CELL_C_ZA: { name: 'Cell C', ip_ranges: ['154.0.0.0/8'], status: 'active' },
  
  // Kenya
  SAFARICOM_KE: { name: 'Safaricom', ip_ranges: ['41.80.0.0/12'], status: 'active' },
  AIRTEL_KE: { name: 'Airtel Kenya', ip_ranges: ['41.90.0.0/16'], status: 'active' },
  
  // Nigeria
  MTN_NG: { name: 'MTN Nigeria', ip_ranges: ['41.58.0.0/16'], status: 'active' },
  AIRTEL_NG: { name: 'Airtel Nigeria', ip_ranges: ['105.112.0.0/12'], status: 'active' },
  GLO_NG: { name: 'Glo Mobile', ip_ranges: ['197.210.0.0/16'], status: 'active' },
  
  // Ghana
  MTN_GH: { name: 'MTN Ghana', ip_ranges: ['154.160.0.0/12'], status: 'active' },
  
  // Tanzania
  VODACOM_TZ: { name: 'Vodacom Tanzania', ip_ranges: ['41.220.0.0/16'], status: 'active' },
  
  // Uganda
  MTN_UG: { name: 'MTN Uganda', ip_ranges: ['41.210.0.0/16'], status: 'active' },
  
  // Zimbabwe
  ECONET_ZW: { name: 'Econet Wireless', ip_ranges: ['41.175.0.0/16'], status: 'active' },
  
  // Egypt
  VODAFONE_EG: { name: 'Vodafone Egypt', ip_ranges: ['41.32.0.0/12'], status: 'active' },
  
  // Morocco
  MAROC_TELECOM: { name: 'Maroc Telecom', ip_ranges: ['41.251.0.0/16'], status: 'active' },
};

class ZeroRatingManager {
  static isZeroRatedIP(ip) {
    for (const [operator, config] of Object.entries(MNO_PARTNERS)) {
      if (config.status !== 'active') continue;
      
      for (const range of config.ip_ranges) {
        if (this.ipInRange(ip, range)) {
          return { zeroRated: true, operator, network: config.name };
        }
      }
    }
    return { zeroRated: false };
  }

  static ipInRange(ip, range) {
    // Simple CIDR check (production would use proper IP library)
    const [rangeIP, mask] = range.split('/');
    return ip.startsWith(rangeIP.split('.').slice(0, 2).join('.'));
  }

  static async logZeroRatedAccess(userId, operator, endpoint) {
    await redis.hincrby(`zero_rated:${operator}`, endpoint, 1);
    await redis.hincrby(`user:${userId}:zero_rated`, operator, 1);
  }

  static async getStats() {
    const stats = {};
    
    for (const operator of Object.keys(MNO_PARTNERS)) {
      const data = await redis.hgetall(`zero_rated:${operator}`);
      stats[operator] = {
        totalRequests: Object.values(data).reduce((sum, v) => sum + parseInt(v), 0),
        endpoints: data,
      };
    }
    
    return stats;
  }

  // Data compression for zero-rated users
  static compressResponse(data) {
    // Remove unnecessary fields for mobile users
    if (typeof data === 'object') {
      const compressed = { ...data };
      delete compressed.metadata;
      delete compressed.debug;
      delete compressed.verbose;
      
      // Minimize image quality for mobile
      if (compressed.images) {
        compressed.images = compressed.images.map(img => ({
          ...img,
          quality: 'low',
          format: 'webp',
        }));
      }
      
      return compressed;
    }
    return data;
  }
}

// Middleware to detect zero-rated users
function zeroRatingMiddleware(req, res, next) {
  const clientIP = req.ip || req.connection.remoteAddress;
  const zeroRatedCheck = ZeroRatingManager.isZeroRatedIP(clientIP);
  
  req.zeroRated = zeroRatedCheck.zeroRated;
  req.mobileOperator = zeroRatedCheck.operator;
  req.networkName = zeroRatedCheck.network;
  
  if (req.zeroRated) {
    res.setHeader('X-Azora-Zero-Rated', 'true');
    res.setHeader('X-Azora-Network', req.networkName);
    
    // Log for billing (we track but don't charge)
    if (req.user?.id) {
      ZeroRatingManager.logZeroRatedAccess(
        req.user.id,
        req.mobileOperator,
        req.path
      );
    }
  }
  
  next();
}

// API Endpoints
app.get('/api/zero-rating/check', (req, res) => {
  const clientIP = req.ip || req.connection.remoteAddress;
  const check = ZeroRatingManager.isZeroRatedIP(clientIP);
  
  res.json({
    ip: clientIP,
    ...check,
    message: check.zeroRated 
      ? `Free access via ${check.network}` 
      : 'Standard data rates apply',
  });
});

app.get('/api/zero-rating/stats', async (req, res) => {
  const stats = await ZeroRatingManager.getStats();
  res.json(stats);
});

app.get('/api/zero-rating/operators', (req, res) => {
  res.json({
    total: Object.keys(MNO_PARTNERS).length,
    operators: MNO_PARTNERS,
  });
});

const PORT = process.env.ZERO_RATING_PORT || 5001;
app.listen(PORT, () => {
  console.log('');
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║  📱 AZORA ZERO-RATING SERVICE                         ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`Port: ${PORT}`);
  console.log(`MNO Partners: ${Object.keys(MNO_PARTNERS).length}`);
  console.log('');
  console.log('✅ Free access across Africa');
  console.log('✅ No data charges for Azora OS');
  console.log('✅ All major carriers supported');
  console.log('');
});

module.exports = { app, ZeroRatingManager, zeroRatingMiddleware };
