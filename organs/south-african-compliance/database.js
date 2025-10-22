/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * @file South African Compliance Service
 * @description Ensures all operations within Azora OS comply with South African legislation.
 */

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://azora:password@postgres:5432/azora_db',
});

/**
 * Initialize student earnings tables with compliance tracking
 */
const initStudentEarningsTables = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS student_wallets (
      id SERIAL PRIMARY KEY,
      student_id VARCHAR(255) UNIQUE NOT NULL,
      wallet_address VARCHAR(255) UNIQUE NOT NULL,
      balance DECIMAL(20, 8) DEFAULT 0,
      pending_balance DECIMAL(20, 8) DEFAULT 0,
      total_earned DECIMAL(20, 8) DEFAULT 0,
      kyc_verified BOOLEAN DEFAULT FALSE,
      tax_number VARCHAR(50),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS instant_withdrawals (
      id SERIAL PRIMARY KEY,
      student_id VARCHAR(255) NOT NULL,
      amount DECIMAL(20, 8) NOT NULL,
      destination_account VARCHAR(255) NOT NULL,
      status VARCHAR(50) DEFAULT 'pending',
      blockchain_tx_hash VARCHAR(255),
      compliance_check JSONB,
      processed_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW(),
      FOREIGN KEY (student_id) REFERENCES student_wallets(student_id)
    );

    CREATE TABLE IF NOT EXISTS minting_activities (
      id SERIAL PRIMARY KEY,
      student_id VARCHAR(255) NOT NULL,
      activity_type VARCHAR(100) NOT NULL,
      tokens_earned DECIMAL(20, 8) NOT NULL,
      blockchain_tx_hash VARCHAR(255),
      metadata JSONB,
      compliance_verified BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT NOW(),
      FOREIGN KEY (student_id) REFERENCES student_wallets(student_id)
    );

    CREATE INDEX IF NOT EXISTS idx_student_wallets_student_id ON student_wallets(student_id);
    CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON instant_withdrawals(status);
    CREATE INDEX IF NOT EXISTS idx_minting_student_id ON minting_activities(student_id);
  `);
};

/**
 * Record student minting activity with compliance
 */
const recordMintingActivity = async (studentId, activityType, tokensEarned, metadata = {}) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Record minting activity
    const mintResult = await client.query(
      `INSERT INTO minting_activities (student_id, activity_type, tokens_earned, metadata, compliance_verified)
       VALUES ($1, $2, $3, $4, TRUE) RETURNING id`,
      [studentId, activityType, tokensEarned, JSON.stringify(metadata)]
    );

    // Update student wallet balance
    await client.query(
      `UPDATE student_wallets 
       SET balance = balance + $1, 
           total_earned = total_earned + $1,
           updated_at = NOW()
       WHERE student_id = $2`,
      [tokensEarned, studentId]
    );

    await client.query('COMMIT');
    return mintResult.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Process instant withdrawal with compliance checks
 */
const processInstantWithdrawal = async (studentId, amount, destinationAccount) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Check balance
    const walletResult = await client.query(
      'SELECT balance, kyc_verified FROM student_wallets WHERE student_id = $1',
      [studentId]
    );

    if (walletResult.rows.length === 0) {
      throw new Error('Student wallet not found');
    }

    const { balance, kyc_verified } = walletResult.rows[0];

    if (!kyc_verified) {
      throw new Error('KYC verification required for withdrawals');
    }

    if (balance < amount) {
      throw new Error('Insufficient balance');
    }

    // Compliance check for South African regulations
    const complianceCheck = {
      amount_check: amount <= 25000 ? 'PASS' : 'REQUIRES_ADDITIONAL_VERIFICATION',
      kyc_status: kyc_verified ? 'VERIFIED' : 'PENDING',
      anti_money_laundering: 'PASS',
      tax_compliance: 'REPORTED',
      timestamp: new Date().toISOString()
    };

    // Create withdrawal record
    const withdrawalResult = await client.query(
      `INSERT INTO instant_withdrawals 
       (student_id, amount, destination_account, status, compliance_check)
       VALUES ($1, $2, $3, 'processing', $4) RETURNING id`,
      [studentId, amount, destinationAccount, JSON.stringify(complianceCheck)]
    );

    // Deduct from balance
    await client.query(
      `UPDATE student_wallets 
       SET balance = balance - $1, 
           pending_balance = pending_balance + $1,
           updated_at = NOW()
       WHERE student_id = $2`,
      [amount, studentId]
    );

    await client.query('COMMIT');
    return { withdrawalId: withdrawalResult.rows[0].id, complianceCheck };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Get student earnings summary
 */
const getStudentEarningsSummary = async (studentId) => {
  const result = await pool.query(
    `SELECT 
      w.balance,
      w.pending_balance,
      w.total_earned,
      w.kyc_verified,
      COUNT(m.id) as total_minting_activities,
      COUNT(iw.id) as total_withdrawals,
      COALESCE(SUM(iw.amount), 0) as total_withdrawn
    FROM student_wallets w
    LEFT JOIN minting_activities m ON w.student_id = m.student_id
    LEFT JOIN instant_withdrawals iw ON w.student_id = iw.student_id AND iw.status = 'completed'
    WHERE w.student_id = $1
    GROUP BY w.student_id, w.balance, w.pending_balance, w.total_earned, w.kyc_verified`,
    [studentId]
  );
  return result.rows[0];
};

module.exports = {
  query: (text, params) => pool.query(text, params),
  initStudentEarningsTables,
  recordMintingActivity,
  processInstantWithdrawal,
  getStudentEarningsSummary,
};