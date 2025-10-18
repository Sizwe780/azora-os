-- Azora OS Complete Database Schema
-- Supports all 193 UN countries and autonomous operations

-- Users table (global)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('student', 'driver', 'vendor', 'partner', 'founder', 'admin')),
  country_code VARCHAR(3) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Azora Coin Wallets
CREATE TABLE IF NOT EXISTS azr_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  blockchain_address VARCHAR(42) UNIQUE NOT NULL,
  balance DECIMAL(20, 8) DEFAULT 0,
  staked_balance DECIMAL(20, 8) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Transactions
CREATE TABLE IF NOT EXISTS azr_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_wallet UUID REFERENCES azr_wallets(id),
  to_wallet UUID REFERENCES azr_wallets(id),
  amount DECIMAL(20, 8) NOT NULL,
  transaction_hash VARCHAR(66) UNIQUE NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('mint', 'transfer', 'stake', 'unstake', 'burn')),
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Student Earnings
CREATE TABLE IF NOT EXISTS student_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  activity VARCHAR(100) NOT NULL,
  azr_earned DECIMAL(10, 2) NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Services Health Log
CREATE TABLE IF NOT EXISTS service_health_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_name VARCHAR(100) NOT NULL,
  status VARCHAR(20) NOT NULL,
  response_time_ms INTEGER,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Compliance Records
CREATE TABLE IF NOT EXISTS compliance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  framework VARCHAR(100) NOT NULL,
  status VARCHAR(20) NOT NULL,
  audit_trail JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_country ON users(country_code);
CREATE INDEX idx_wallets_user ON azr_wallets(user_id);
CREATE INDEX idx_transactions_wallets ON azr_transactions(from_wallet, to_wallet);
CREATE INDEX idx_earnings_user ON student_earnings(user_id);
CREATE INDEX idx_health_logs_service ON service_health_logs(service_name, created_at);
CREATE INDEX idx_compliance_entity ON compliance_records(entity_type, entity_id);

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO azora_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO azora_user;
-- Distributed Tracing Schema

CREATE TABLE IF NOT EXISTS distributed_traces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trace_id VARCHAR(36) NOT NULL,
  span_id VARCHAR(36) NOT NULL,
  parent_span_id VARCHAR(36),
  service_name VARCHAR(100) NOT NULL,
  operation VARCHAR(255) NOT NULL,
  timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
  duration INTEGER DEFAULT 0,
  status_code INTEGER DEFAULT 200,
  request JSONB DEFAULT '{}'::jsonb,
  response JSONB DEFAULT '{}'::jsonb,
  error TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  neighbors JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_traces_trace_id ON distributed_traces(trace_id);
CREATE INDEX idx_traces_service ON distributed_traces(service_name, timestamp DESC);
CREATE INDEX idx_traces_timestamp ON distributed_traces(timestamp DESC);
CREATE INDEX idx_traces_operation ON distributed_traces(service_name, operation);

CREATE TABLE IF NOT EXISTS recovery_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_name VARCHAR(100) NOT NULL,
  strategy JSONB NOT NULL,
  results JSONB NOT NULL,
  success BOOLEAN NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW(),
  recovery_duration INTEGER
);

CREATE INDEX idx_recovery_service ON recovery_records(service_name, timestamp DESC);
CREATE INDEX idx_recovery_success ON recovery_records(success, timestamp DESC);

-- Grants
GRANT ALL PRIVILEGES ON distributed_traces TO azora_user;
GRANT ALL PRIVILEGES ON recovery_records TO azora_user;
