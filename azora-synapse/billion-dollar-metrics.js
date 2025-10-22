/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

// filepath: /workspaces/azora-os/services/valuation-dashboard/billion-dollar-metrics.js
/**
 * Azora OS - Billion Dollar Valuation Metrics
 * Real-time tracking of path to $1B+ valuation
 */

const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

const db = new Pool({ connectionString: process.env.DATABASE_URL });

class ValuationMetrics {
  static async calculateCurrentValuation() {
    // Get current metrics
    const { rows: [coinStats] } = await db.query(`
      SELECT 
        SUM(CASE WHEN user_type = 'enterprise' THEN net_amount ELSE 0 END) as enterprise_minted,
        SUM(CASE WHEN user_type = 'business' THEN net_amount ELSE 0 END) as business_minted,
        SUM(CASE WHEN user_type = 'student' THEN net_amount ELSE 0 END) as student_minted,
        COUNT(DISTINCT user_id) as total_users,
        COUNT(DISTINCT CASE WHEN user_type = 'enterprise' THEN user_id END) as enterprise_users
      FROM earnings_ledger
    `);

    const enterpriseMinted = parseFloat(coinStats.enterprise_minted || 0);
    const businessMinted = parseFloat(coinStats.business_minted || 0);
    const studentMinted = parseFloat(coinStats.student_minted || 0);
    const totalMinted = enterpriseMinted + businessMinted + studentMinted;

    // Valuation model based on enterprise adoption
    const basePrice = 1.0; // $1 USD starting price
    const enterpriseMultiplier = 1 + (enterpriseMinted / 600000) * 999999; // Up to $1M per coin at full adoption
    const currentPricePerAZR = basePrice * enterpriseMultiplier;

    const currentMarketCap = totalMinted * currentPricePerAZR;

    // Path to $1B
    const billionTarget = 1000000000; // $1 billion
    const percentToFirstBillion = (currentMarketCap / billionTarget) * 100;

    // Path to $1T
    const trillionTarget = 1000000000000; // $1 trillion
    const targetPricePerAZR = 1000000; // $1M per coin
    const percentToTrillion = (currentPricePerAZR / targetPricePerAZR) * 100;

    return {
      current: {
        totalMinted,
        pricePerAZR: currentPricePerAZR.toFixed(2),
        marketCap: currentMarketCap.toFixed(0),
        marketCapFormatted: this.formatCurrency(currentMarketCap),
      },
      breakdown: {
        enterprise: {
          minted: enterpriseMinted,
          value: (enterpriseMinted * currentPricePerAZR).toFixed(0),
          valueFormatted: this.formatCurrency(enterpriseMinted * currentPricePerAZR),
          remaining: 600000 - enterpriseMinted,
        },
        business: {
          minted: businessMinted,
          value: (businessMinted * currentPricePerAZR).toFixed(0),
          valueFormatted: this.formatCurrency(businessMinted * currentPricePerAZR),
          remaining: 200000 - businessMinted,
        },
        student: {
          minted: studentMinted,
          value: (studentMinted * currentPricePerAZR).toFixed(0),
          valueFormatted: this.formatCurrency(studentMinted * currentPricePerAZR),
          remaining: 100000 - studentMinted,
          note: `Even 1 AZR is worth $${currentPricePerAZR.toFixed(2)} for students`,
        },
      },
      milestones: {
        toFirstBillion: {
          target: billionTarget,
          current: currentMarketCap,
          percent: percentToFirstBillion.toFixed(2),
          remaining: billionTarget - currentMarketCap,
          remainingFormatted: this.formatCurrency(billionTarget - currentMarketCap),
        },
        toTrillion: {
          target: trillionTarget,
          current: currentMarketCap,
          percent: percentToTrillion.toFixed(4),
          targetPricePerAZR: targetPricePerAZR,
          currentPricePerAZR: currentPricePerAZR.toFixed(2),
        },
      },
      users: {
        total: parseInt(coinStats.total_users || 0),
        enterprises: parseInt(coinStats.enterprise_users || 0),
        averageHoldingPerUser: totalMinted / (parseInt(coinStats.total_users) || 1),
      },
    };
  }

  static formatCurrency(value) {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  }

  static async getEnterpriseMetrics() {
    const { rows } = await db.query(`
      SELECT 
        u.id,
        u.email,
        u.company_name,
        SUM(e.net_amount) as total_earned,
        COUNT(e.id) as transaction_count,
        MAX(e.created_at) as last_earning_date
      FROM users u
      JOIN earnings_ledger e ON u.id = e.user_id
      WHERE e.user_type = 'enterprise'
      GROUP BY u.id
      ORDER BY total_earned DESC
      LIMIT 10
    `);

    return rows;
  }
}

// API Endpoints
app.get('/valuation/current', async (req, res) => {
  try {
    const metrics = await ValuationMetrics.calculateCurrentValuation();
    res.json({ success: true, metrics });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/valuation/top-enterprises', async (req, res) => {
  try {
    const enterprises = await ValuationMetrics.getEnterpriseMetrics();
    res.json({ success: true, enterprises });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.VALUATION_PORT || 5007;
app.listen(PORT, () => {
  console.log('');
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║  📈 AZORA BILLION-DOLLAR VALUATION DASHBOARD         ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`Port: ${PORT}`);
  console.log('');
  console.log('Tracking:');
  console.log('  • Current market cap');
  console.log('  • Path to $1B valuation');
  console.log('  • Path to $1T market cap');
  console.log('  • Enterprise adoption rate');
  console.log('  • Token distribution');
  console.log('');
});

module.exports = { app, ValuationMetrics };
