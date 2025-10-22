/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * @file Student Earnings Database Layer
 * @description Dedicated database management for student earnings with connection pooling
 */

const sqlite3 = require('sqlite3').verbose();
const { promisify } = require('util');

// Use SQLite for development
const db = new sqlite3.Database('./student_earnings.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
  }
});

// Promisify database methods
const dbRun = promisify(db.run.bind(db));
const dbGet = promisify(db.get.bind(db));
const dbAll = promisify(db.all.bind(db));

// Create a pool-like interface for compatibility
const pool = {
  query: async (text, params = []) => {
    return new Promise((resolve, reject) => {
      if (text.trim().toUpperCase().startsWith('SELECT')) {
        db.all(text, params, (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      } else {
        db.run(text, params, function(err) {
          if (err) reject(err);
          else resolve({ rowCount: this.changes || 0 });
        });
      }
    });
  },
  connect: async () => ({
    query: pool.query,
    release: () => {} // No-op for SQLite
  }),
  end: () => db.close()
};

/**
 * Initialize all database tables and indexes
 */
const initializeDatabase = async () => {
  const client = await pool.connect();
  try {
    console.log('🔧 Initializing Student Earnings Database...');

    // Learning Platform Tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS courses (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
        title TEXT NOT NULL,
        description TEXT,
        saqa_unit_standard TEXT,
        nqf_level INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS modules (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
        course_id TEXT REFERENCES courses(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT,
        order_index INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS lessons (
        id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
        module_id TEXT REFERENCES modules(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        content TEXT,
        video_url TEXT,
        order_index INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS quizzes (
        id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
        lesson_id TEXT REFERENCES lessons(id) ON DELETE CASCADE,
        question TEXT NOT NULL,
        options TEXT NOT NULL, -- JSON string
        correct_answer TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
        email TEXT UNIQUE NOT NULL,
        name TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS enrollments (
        id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        course_id TEXT REFERENCES courses(id) ON DELETE CASCADE,
        enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, course_id)
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS lesson_progress (
        id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        lesson_id TEXT REFERENCES lessons(id) ON DELETE CASCADE,
        completed BOOLEAN DEFAULT FALSE,
        quiz_score REAL,
        completed_at DATETIME,
        UNIQUE(user_id, lesson_id)
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS azr_transactions (
        id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        amount REAL NOT NULL,
        reason TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Minting Activities Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS minting_activities (
        id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
        student_id TEXT NOT NULL,
        activity_type TEXT NOT NULL,
        tokens_earned REAL NOT NULL CHECK (tokens_earned > 0),
        blockchain_tx_hash TEXT,
        metadata TEXT, -- JSON string
        compliance_verified BOOLEAN DEFAULT FALSE,
        compliance_check_data TEXT, -- JSON string
        activity_status TEXT DEFAULT 'completed' CHECK (activity_status IN ('pending', 'completed', 'failed', 'reversed')),
        source_system TEXT,
        academic_year TEXT,
        semester TEXT,
        course_code TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        processed_at DATETIME,
        FOREIGN KEY (student_id) REFERENCES student_wallets(student_id) ON DELETE CASCADE
      )
    `);

    await client.query(`CREATE INDEX IF NOT EXISTS idx_minting_student_id ON minting_activities(student_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_minting_activity_type ON minting_activities(activity_type)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_minting_created_at ON minting_activities(created_at DESC)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_minting_status ON minting_activities(activity_status)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_minting_blockchain_tx ON minting_activities(blockchain_tx_hash)`);

    // Instant Withdrawals Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS instant_withdrawals (
        id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
        student_id TEXT NOT NULL,
        amount REAL NOT NULL CHECK (amount > 0),
        destination_account TEXT NOT NULL,
        destination_type TEXT DEFAULT 'bank' CHECK (destination_type IN ('bank', 'crypto', 'mobile_money', 'ewallet')),
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled', 'reversed')),
        blockchain_tx_hash TEXT,
        compliance_check TEXT, -- JSON string
        compliance_status TEXT DEFAULT 'pending',
        failure_reason TEXT,
        fees_charged REAL DEFAULT 0,
        net_amount REAL,
        processing_time_seconds INTEGER,
        processed_at DATETIME,
        completed_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES student_wallets(student_id) ON DELETE CASCADE
      )
    `);

    await client.query(`CREATE INDEX IF NOT EXISTS idx_withdrawals_student_id ON instant_withdrawals(student_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON instant_withdrawals(status)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_withdrawals_created_at ON instant_withdrawals(created_at DESC)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_withdrawals_blockchain_tx ON instant_withdrawals(blockchain_tx_hash)`);

    // Transaction Ledger Table (Double-entry bookkeeping)
    await client.query(`
      CREATE TABLE IF NOT EXISTS transaction_ledger (
        id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
        student_id TEXT NOT NULL,
        transaction_type TEXT NOT NULL CHECK (transaction_type IN ('credit', 'debit', 'reversal', 'fee')),
        amount REAL NOT NULL,
        balance_before REAL NOT NULL,
        balance_after REAL NOT NULL,
        reference_id TEXT,
        reference_type TEXT CHECK (reference_type IN ('minting', 'withdrawal', 'adjustment', 'bonus', 'penalty')),
        description TEXT,
        metadata TEXT, -- JSON string
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES student_wallets(student_id) ON DELETE CASCADE
      )
    `);

    await client.query(`CREATE INDEX IF NOT EXISTS idx_ledger_student_id ON transaction_ledger(student_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_ledger_created_at ON transaction_ledger(created_at DESC)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_ledger_reference ON transaction_ledger(reference_id, reference_type)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_ledger_transaction_type ON transaction_ledger(transaction_type)`);

    // Compliance Audit Log
    await client.query(`
      CREATE TABLE IF NOT EXISTS compliance_audit_log (
        id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
        student_id TEXT NOT NULL,
        action TEXT NOT NULL,
        compliance_type TEXT NOT NULL CHECK (compliance_type IN ('KYC', 'AML', 'TAX', 'TRANSACTION_LIMIT', 'IDENTITY', 'SANCTIONS')),
        status TEXT NOT NULL CHECK (status IN ('passed', 'failed', 'pending', 'flagged')),
        check_data TEXT, -- JSON string
        risk_assessment TEXT, -- JSON string
        flags TEXT, -- JSON string
        reviewed_by TEXT,
        reviewed_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES student_wallets(student_id) ON DELETE CASCADE
      )
    `);

    await client.query(`CREATE INDEX IF NOT EXISTS idx_audit_student_id ON compliance_audit_log(student_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_audit_compliance_type ON compliance_audit_log(compliance_type)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_audit_status ON compliance_audit_log(status)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_audit_created_at ON compliance_audit_log(created_at DESC)`);

    // Daily Aggregates for Performance
    await client.query(`
      CREATE TABLE IF NOT EXISTS daily_earning_aggregates (
        id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
        student_id TEXT NOT NULL,
        date TEXT NOT NULL,
        total_earned REAL DEFAULT 0,
        total_withdrawn REAL DEFAULT 0,
        activities_count INTEGER DEFAULT 0,
        withdrawals_count INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(student_id, date),
        FOREIGN KEY (student_id) REFERENCES student_wallets(student_id) ON DELETE CASCADE
      )
    `);

    await client.query(`CREATE INDEX IF NOT EXISTS idx_daily_agg_student_date ON daily_earning_aggregates(student_id, date DESC)`);

    // Activity Type Configuration
    await client.query(`
      CREATE TABLE IF NOT EXISTS activity_type_config (
        id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
        activity_type TEXT UNIQUE NOT NULL,
        tokens_reward REAL NOT NULL CHECK (tokens_reward >= 0),
        description TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        requires_verification BOOLEAN DEFAULT FALSE,
        category TEXT,
        multiplier REAL DEFAULT 1.00,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`CREATE INDEX IF NOT EXISTS idx_activity_type_active ON activity_type_config(is_active)`);

    // Insert default activity types
    await client.query(`
      INSERT OR IGNORE INTO activity_type_config (activity_type, tokens_reward, description, category, requires_verification)
      VALUES 
        ('coursework_completion', 10, 'Completed coursework assignment', 'academic', 1),
        ('quiz_passed', 5, 'Passed a quiz with 70% or higher', 'academic', 1),
        ('project_submission', 25, 'Submitted a major project', 'academic', 1),
        ('peer_review', 3, 'Completed a peer review', 'collaboration', 0),
        ('community_contribution', 15, 'Made a community contribution', 'community', 0),
        ('research_paper', 50, 'Published a research paper', 'research', 1),
        ('hackathon_participation', 100, 'Participated in a hackathon', 'events', 1),
        ('tutorial_completion', 8, 'Completed an online tutorial', 'learning', 0),
        ('attendance_milestone', 20, 'Perfect attendance for a month', 'academic', 1),
        ('mentorship_session', 12, 'Completed a mentorship session', 'collaboration', 0)
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