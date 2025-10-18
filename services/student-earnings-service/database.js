/**
 * @file Student Earnings Database Layer
 * @description Dedicated database management for student earnings with connection pooling
 */

const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.STUDENT_DB_HOST || 'student-earnings-db',
  port: process.env.STUDENT_DB_PORT || 5432,
  database: process.env.STUDENT_DB_NAME || 'student_earnings_db',
  user: process.env.STUDENT_DB_USER || 'student_earnings_user',
  password: process.env.STUDENT_DB_PASSWORD || 'secure_student_earnings_pass',
  max: 20, // Maximum pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle database client', err);
  process.exit(-1);
});

/**
 * Initialize all database tables and indexes
 */
const initializeDatabase = async () => {
  const client = await pool.connect();
  try {
    console.log('🔧 Initializing Student Earnings Database...');

    // Enable extensions
    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    await client.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');

    // Student Wallets Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS student_wallets (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        student_id VARCHAR(255) UNIQUE NOT NULL,
        wallet_address VARCHAR(255) UNIQUE NOT NULL,
        balance DECIMAL(20, 8) DEFAULT 0 CHECK (balance >= 0),
        pending_balance DECIMAL(20, 8) DEFAULT 0 CHECK (pending_balance >= 0),
        total_earned DECIMAL(20, 8) DEFAULT 0,
        total_withdrawn DECIMAL(20, 8) DEFAULT 0,
        kyc_verified BOOLEAN DEFAULT FALSE,
        kyc_verified_at TIMESTAMP,
        tax_number VARCHAR(50),
        id_number VARCHAR(50),
        phone_number VARCHAR(20),
        email VARCHAR(255),
        banking_details JSONB,
        wallet_status VARCHAR(50) DEFAULT 'active' CHECK (wallet_status IN ('active', 'suspended', 'closed')),
        risk_score INTEGER DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        last_activity_at TIMESTAMP DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_student_wallets_student_id ON student_wallets(student_id);
      CREATE INDEX IF NOT EXISTS idx_student_wallets_wallet_address ON student_wallets(wallet_address);
      CREATE INDEX IF NOT EXISTS idx_student_wallets_kyc ON student_wallets(kyc_verified);
      CREATE INDEX IF NOT EXISTS idx_student_wallets_status ON student_wallets(wallet_status);
    `);

    // Minting Activities Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS minting_activities (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        student_id VARCHAR(255) NOT NULL,
        activity_type VARCHAR(100) NOT NULL,
        tokens_earned DECIMAL(20, 8) NOT NULL CHECK (tokens_earned > 0),
        blockchain_tx_hash VARCHAR(255),
        metadata JSONB DEFAULT '{}',
        compliance_verified BOOLEAN DEFAULT FALSE,
        compliance_check_data JSONB,
        activity_status VARCHAR(50) DEFAULT 'completed' CHECK (activity_status IN ('pending', 'completed', 'failed', 'reversed')),
        source_system VARCHAR(100),
        academic_year VARCHAR(20),
        semester VARCHAR(20),
        course_code VARCHAR(50),
        created_at TIMESTAMP DEFAULT NOW(),
        processed_at TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES student_wallets(student_id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_minting_student_id ON minting_activities(student_id);
      CREATE INDEX IF NOT EXISTS idx_minting_activity_type ON minting_activities(activity_type);
      CREATE INDEX IF NOT EXISTS idx_minting_created_at ON minting_activities(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_minting_status ON minting_activities(activity_status);
      CREATE INDEX IF NOT EXISTS idx_minting_blockchain_tx ON minting_activities(blockchain_tx_hash);
    `);

    // Instant Withdrawals Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS instant_withdrawals (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        student_id VARCHAR(255) NOT NULL,
        amount DECIMAL(20, 8) NOT NULL CHECK (amount > 0),
        destination_account VARCHAR(255) NOT NULL,
        destination_type VARCHAR(50) DEFAULT 'bank' CHECK (destination_type IN ('bank', 'crypto', 'mobile_money', 'ewallet')),
        status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled', 'reversed')),
        blockchain_tx_hash VARCHAR(255),
        compliance_check JSONB,
        compliance_status VARCHAR(50) DEFAULT 'pending',
        failure_reason TEXT,
        fees_charged DECIMAL(20, 8) DEFAULT 0,
        net_amount DECIMAL(20, 8),
        processing_time_seconds INTEGER,
        processed_at TIMESTAMP,
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY (student_id) REFERENCES student_wallets(student_id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_withdrawals_student_id ON instant_withdrawals(student_id);
      CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON instant_withdrawals(status);
      CREATE INDEX IF NOT EXISTS idx_withdrawals_created_at ON instant_withdrawals(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_withdrawals_blockchain_tx ON instant_withdrawals(blockchain_tx_hash);
    `);

    // Transaction Ledger Table (Double-entry bookkeeping)
    await client.query(`
      CREATE TABLE IF NOT EXISTS transaction_ledger (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        student_id VARCHAR(255) NOT NULL,
        transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('credit', 'debit', 'reversal', 'fee')),
        amount DECIMAL(20, 8) NOT NULL,
        balance_before DECIMAL(20, 8) NOT NULL,
        balance_after DECIMAL(20, 8) NOT NULL,
        reference_id UUID,
        reference_type VARCHAR(50) CHECK (reference_type IN ('minting', 'withdrawal', 'adjustment', 'bonus', 'penalty')),
        description TEXT,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY (student_id) REFERENCES student_wallets(student_id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_ledger_student_id ON transaction_ledger(student_id);
      CREATE INDEX IF NOT EXISTS idx_ledger_created_at ON transaction_ledger(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_ledger_reference ON transaction_ledger(reference_id, reference_type);
      CREATE INDEX IF NOT EXISTS idx_ledger_transaction_type ON transaction_ledger(transaction_type);
    `);

    // Compliance Audit Log
    await client.query(`
      CREATE TABLE IF NOT EXISTS compliance_audit_log (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        student_id VARCHAR(255) NOT NULL,
        action VARCHAR(100) NOT NULL,
        compliance_type VARCHAR(50) NOT NULL CHECK (compliance_type IN ('KYC', 'AML', 'TAX', 'TRANSACTION_LIMIT', 'IDENTITY', 'SANCTIONS')),
        status VARCHAR(50) NOT NULL CHECK (status IN ('passed', 'failed', 'pending', 'flagged')),
        check_data JSONB,
        risk_assessment JSONB,
        flags JSONB DEFAULT '[]',
        reviewed_by VARCHAR(255),
        reviewed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY (student_id) REFERENCES student_wallets(student_id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_audit_student_id ON compliance_audit_log(student_id);
      CREATE INDEX IF NOT EXISTS idx_audit_compliance_type ON compliance_audit_log(compliance_type);
      CREATE INDEX IF NOT EXISTS idx_audit_status ON compliance_audit_log(status);
      CREATE INDEX IF NOT EXISTS idx_audit_created_at ON compliance_audit_log(created_at DESC);
    `);

    // Daily Aggregates for Performance
    await client.query(`
      CREATE TABLE IF NOT EXISTS daily_earning_aggregates (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        student_id VARCHAR(255) NOT NULL,
        date DATE NOT NULL,
        total_earned DECIMAL(20, 8) DEFAULT 0,
        total_withdrawn DECIMAL(20, 8) DEFAULT 0,
        activities_count INTEGER DEFAULT 0,
        withdrawals_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(student_id, date),
        FOREIGN KEY (student_id) REFERENCES student_wallets(student_id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_daily_agg_student_date ON daily_earning_aggregates(student_id, date DESC);
    `);

    // Activity Type Configuration
    await client.query(`
      CREATE TABLE IF NOT EXISTS activity_type_config (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        activity_type VARCHAR(100) UNIQUE NOT NULL,
        tokens_reward DECIMAL(20, 8) NOT NULL CHECK (tokens_reward >= 0),
        description TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        requires_verification BOOLEAN DEFAULT FALSE,
        category VARCHAR(50),
        multiplier DECIMAL(4, 2) DEFAULT 1.00,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_activity_type_active ON activity_type_config(is_active);
    `);

    // Insert default activity types
    await client.query(`
      INSERT INTO activity_type_config (activity_type, tokens_reward, description, category, requires_verification)
      VALUES 
        ('coursework_completion', 10, 'Completed coursework assignment', 'academic', true),
        ('quiz_passed', 5, 'Passed a quiz with 70% or higher', 'academic', true),
        ('project_submission', 25, 'Submitted a major project', 'academic', true),
        ('peer_review', 3, 'Completed a peer review', 'collaboration', false),
        ('community_contribution', 15, 'Made a community contribution', 'community', false),
        ('research_paper', 50, 'Published a research paper', 'research', true),
        ('hackathon_participation', 100, 'Participated in a hackathon', 'events', true),
        ('tutorial_completion', 8, 'Completed an online tutorial', 'learning', false),
        ('attendance_milestone', 20, 'Perfect attendance for a month', 'academic', true),
        ('mentorship_session', 12, 'Completed a mentorship session', 'collaboration', false)
      ON CONFLICT (activity_type) DO NOTHING;
    `);

    // Create triggers for updated_at
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ language 'plpgsql';

      DROP TRIGGER IF EXISTS update_student_wallets_updated_at ON student_wallets;
      CREATE TRIGGER update_student_wallets_updated_at 
        BEFORE UPDATE ON student_wallets 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

      DROP TRIGGER IF EXISTS update_activity_type_config_updated_at ON activity_type_config;
      CREATE TRIGGER update_activity_type_config_updated_at 
        BEFORE UPDATE ON activity_type_config 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

      DROP TRIGGER IF EXISTS update_daily_aggregates_updated_at ON daily_earning_aggregates;
      CREATE TRIGGER update_daily_aggregates_updated_at 
        BEFORE UPDATE ON daily_earning_aggregates 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);

    console.log('✅ Student Earnings Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Health check for database
 */
const healthCheck = async () => {
  try {
    const result = await pool.query('SELECT NOW()');
    return { healthy: true, timestamp: result.rows[0].now };
  } catch (error) {
    return { healthy: false, error: error.message };
  }
};

/**
 * Graceful shutdown
 */
const closePool = async () => {
  await pool.end();
  console.log('Database pool closed');
};

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
  initializeDatabase,
  healthCheck,
  closePool
};