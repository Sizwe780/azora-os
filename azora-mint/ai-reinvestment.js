/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

// filepath: /workspaces/azora-os/services/ai-treasury/ai-reinvestment.js
/**
 * AI Treasury & Reinvestment System
 * 
 * ENTERPRISE-FIRST MODEL:
 * • 1% of all AI earnings go to AI Treasury
 * • Students receive earnings from their 10% allocation pool
 * • Enterprises get priority allocation and higher rewards
 * • AI reinvestment funds R&D and ecosystem growth
 * 
 * EARNING TIERS:
 * • Enterprise Partners: 1,000-100,000 AZR per contract
 * • Business Clients: 100-10,000 AZR per engagement
 * • Students: 0.1-100 AZR per task (from student pool)
 */

const Redis = require('ioredis');
const { Pool } = require('pg');

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
const db = new Pool({ connectionString: process.env.DATABASE_URL || 'postgres://postgres@localhost:5432/azora' });

// Treasury wallets (different pools)
const AI_TREASURY_WALLET = process.env.AI_TREASURY_WALLET || 'wallet-ai-treasury';
const STUDENT_POOL_WALLET = 'wallet-student-pool';
const ENTERPRISE_POOL_WALLET = 'wallet-enterprise-pool';
const BUSINESS_POOL_WALLET = 'wallet-business-pool';

// Allocation caps (in AZR)
const STUDENT_TOTAL_CAP = 100000; // 100,000 AZR total for students
const ENTERPRISE_TOTAL_CAP = 600000; // 600,000 AZR for enterprises

class AITreasury {
  static async processEarning(earningData) {
    const { id, userId, amount, source, userType } = earningData;
    const amountNum = parseFloat(amount);
    
    if (isNaN(amountNum) || amountNum <= 0) {
      console.warn('Invalid amount:', amount);
      return;
    }

    // Calculate 1% reinvestment
    const reinvest = Number((amountNum * 0.01).toFixed(6));
    const netAmount = Number((amountNum - reinvest).toFixed(6));

    const client = await db.connect();
    try {
      await client.query('BEGIN');

      // Check allocation caps
      const { rows: [poolStats] } = await client.query(
        `SELECT 
          SUM(CASE WHEN user_type = 'student' THEN amount ELSE 0 END) as student_minted,
          SUM(CASE WHEN user_type = 'enterprise' THEN amount ELSE 0 END) as enterprise_minted,
          SUM(CASE WHEN user_type = 'business' THEN amount ELSE 0 END) as business_minted
         FROM earnings_ledger`
      );

      const studentMinted = parseFloat(poolStats.student_minted || 0);
      const enterpriseMinted = parseFloat(poolStats.enterprise_minted || 0);

      // Enforce allocation caps
      if (userType === 'student') {
        if (studentMinted + netAmount > STUDENT_TOTAL_CAP) {
          throw new Error(`Student pool exhausted. Total cap: ${STUDENT_TOTAL_CAP} AZR`);
        }
      } else if (userType === 'enterprise') {
        if (enterpriseMinted + netAmount > ENTERPRISE_TOTAL_CAP) {
          throw new Error(`Enterprise pool exhausted. Total cap: ${ENTERPRISE_TOTAL_CAP} AZR`);
        }
      }

      // 1. Credit AI Treasury (1% reinvestment)
      await client.query(
        `INSERT INTO transactions (id, wallet_id, type, amount, meta, created_at)
         VALUES ($1, $2, 'credit', $3, $4, NOW())`,
        [
          `tx-ai-reinvest-${id}`,
          AI_TREASURY_WALLET,
          reinvest,
          JSON.stringify({ source, reason: 'ai-reinvestment', originalAmount: amountNum })
        ]
      );

      // 2. Credit user wallet (99%)
      await client.query(
        `UPDATE wallets 
         SET balance = balance + $1,
             total_earned = total_earned + $2,
             updated_at = NOW()
         WHERE user_id = $3`,
        [netAmount, amountNum, userId]
      );

      // 3. Record in earnings ledger (for cap enforcement)
      await client.query(
        `INSERT INTO earnings_ledger (
          id, user_id, user_type, amount, net_amount, reinvest_amount, 
          source, created_at
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
        [
          `earning-${id}`,
          userId,
          userType,
          amountNum,
          netAmount,
          reinvest,
          source
        ]
      );

      // 4. Update pool statistics
      await client.query(
        `INSERT INTO pool_statistics (
          pool_type, total_minted, last_mint_amount, last_mint_user, updated_at
         )
         VALUES ($1, $2, $3, $4, NOW())
         ON CONFLICT (pool_type) 
         DO UPDATE SET 
           total_minted = pool_statistics.total_minted + EXCLUDED.total_minted,
           last_mint_amount = EXCLUDED.last_mint_amount,
           last_mint_user = EXCLUDED.last_mint_user,
           updated_at = NOW()`,
        [userType, netAmount, netAmount, userId]
      );

      // 5. Audit trail
      await client.query(
        `INSERT INTO audit_log (
          id, action, user_id, details, created_at
         )
         VALUES ($1, $2, $3, $4, NOW())`,
        [
          `audit-${id}`,
          'ai_earning_processed',
          userId,
          JSON.stringify({
            amount: amountNum,
            netAmount,
            reinvest,
            source,
            userType,
            poolStats: {
              studentMinted: studentMinted + (userType === 'student' ? netAmount : 0),
              enterpriseMinted: enterpriseMinted + (userType === 'enterprise' ? netAmount : 0),
            }
          })
        ]
      );

      await client.query('COMMIT');

      console.log(`✅ AI Earning processed: ${userId} received ${netAmount} AZR (${reinvest} AZR to treasury)`);

    } catch (err) {
      await client.query('ROLLBACK');
      console.error('❌ AI earning processing failed:', err);
      
      // Log failure for retry
      await redis.lpush('queue:failed-earnings', JSON.stringify({
        earningData,
        error: err.message,
        timestamp: Date.now()
      }));
      
      throw err;
    } finally {
      client.release();
    }
  }

  static async getPoolStatistics() {
    const { rows } = await db.query(
      `SELECT * FROM pool_statistics ORDER BY pool_type`
    );

    const stats = {
      student: {
        allocated: STUDENT_TOTAL_CAP,
        minted: 0,
        remaining: STUDENT_TOTAL_CAP,
        percentage: 10
      },
      enterprise: {
        allocated: ENTERPRISE_TOTAL_CAP,
        minted: 0,
        remaining: ENTERPRISE_TOTAL_CAP,
        percentage: 60
      },
      aiTreasury: {
        accumulated: 0
      }
    };

    rows.forEach(row => {
      if (row.pool_type === 'student') {
        stats.student.minted = parseFloat(row.total_minted);
        stats.student.remaining = STUDENT_TOTAL_CAP - stats.student.minted;
      } else if (row.pool_type === 'enterprise') {
        stats.enterprise.minted = parseFloat(row.total_minted);
        stats.enterprise.remaining = ENTERPRISE_TOTAL_CAP - stats.enterprise.minted;
      }
    });

    // Get AI Treasury balance
    const { rows: [treasury] } = await db.query(
      `SELECT SUM(amount) as total FROM transactions WHERE wallet_id = $1`,
      [AI_TREASURY_WALLET]
    );
    stats.aiTreasury.accumulated = parseFloat(treasury?.total || 0);

    return stats;
  }

  static async getValueProjection() {
    const stats = await this.getPoolStatistics();
    
    // Target: $1M per AZR = $1 Trillion market cap
    const targetPricePerAZR = 1000000; // $1M
    const currentSupply = 1000000; // Fixed supply
    
    return {
      targetMarketCap: currentSupply * targetPricePerAZR,
      targetPricePerAZR,
      currentSupply,
      pools: {
        enterprise: {
          value: stats.enterprise.allocated * targetPricePerAZR,
          formatted: `$${(stats.enterprise.allocated * targetPricePerAZR / 1e9).toFixed(2)}B`
        },
        student: {
          value: stats.student.allocated * targetPricePerAZR,
          formatted: `$${(stats.student.allocated * targetPricePerAZR / 1e9).toFixed(2)}B`,
          note: 'Even 1 AZR = $1M for students at target'
        }
      }
    };
  }
}

// Worker: Listen to Redis queue for earnings
async function startWorker() {
  console.log('🤖 Starting AI Treasury & Reinvestment Worker...');
  console.log('');
  console.log('📊 Tokenomics:');
  console.log('   • Enterprise Pool: 600,000 AZR (60%)');
  console.log('   • Business Pool: 200,000 AZR (20%)');
  console.log('   • Student Pool: 100,000 AZR (10%)');
  console.log('   • AI Treasury: 1% of all earnings');
  console.log('');

  while (true) {
    try {
      const raw = await redis.brpop('queue:ai-earnings', 0);
      if (!raw) continue;

      const earningData = JSON.parse(raw[1]);
      await AITreasury.processEarning(earningData);

    } catch (err) {
      console.error('Worker error:', err);
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}

// Express API
const express = require('express');
const app = express();
app.use(express.json());

app.get('/treasury/stats', async (req, res) => {
  try {
    const stats = await AITreasury.getPoolStatistics();
    res.json({ success: true, stats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/treasury/projection', async (req, res) => {
  try {
    const projection = await AITreasury.getValueProjection();
    res.json({ success: true, projection });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/treasury/simulate-earning', async (req, res) => {
  try {
    const { userId, amount, source, userType } = req.body;
    
    // Push to queue for processing
    await redis.lpush('queue:ai-earnings', JSON.stringify({
      id: `sim-${Date.now()}`,
      userId,
      amount: parseFloat(amount),
      source: source || 'simulation',
      userType: userType || 'student'
    }));

    res.json({ success: true, message: 'Earning queued for processing' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.AI_TREASURY_PORT || 5006;
app.listen(PORT, () => {
  console.log(`💰 AI Treasury API running on port ${PORT}`);
});

// Start worker if run directly
if (require.main === module) {
  startWorker().catch(err => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { AITreasury, startWorker };
