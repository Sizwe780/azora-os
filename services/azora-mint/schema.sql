-- AI Treasury & Enterprise Tokenomics Schema

-- Earnings ledger (tracks all mints and enforces caps)
CREATE TABLE IF NOT EXISTS earnings_ledger (
  id VARCHAR(100) PRIMARY KEY,
  user_id UUID NOT NULL,
  user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('student', 'enterprise', 'business', 'governance')),
  amount DECIMAL(20, 6) NOT NULL,
  net_amount DECIMAL(20, 6) NOT NULL,
  reinvest_amount DECIMAL(20, 6) NOT NULL,
  source VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Pool statistics (real-time tracking of allocations)
CREATE TABLE IF NOT EXISTS pool_statistics (
  pool_type VARCHAR(20) PRIMARY KEY CHECK (pool_type IN ('student', 'enterprise', 'business', 'governance', 'ai_treasury')),
  total_minted DECIMAL(20, 6) DEFAULT 0,
  last_mint_amount DECIMAL(20, 6),
  last_mint_user UUID,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Audit log
CREATE TABLE IF NOT EXISTS audit_log (
  id VARCHAR(100) PRIMARY KEY,
  action VARCHAR(50) NOT NULL,
  user_id UUID,
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Initialize pool statistics
INSERT INTO pool_statistics (pool_type, total_minted) VALUES
  ('student', 0),
  ('enterprise', 0),
  ('business', 0),
  ('governance', 0),
  ('ai_treasury', 0)
ON CONFLICT (pool_type) DO NOTHING;

-- Indexes
CREATE INDEX idx_earnings_user_type ON earnings_ledger(user_type, created_at);
CREATE INDEX idx_earnings_user ON earnings_ledger(user_id, created_at);
CREATE INDEX idx_audit_action ON audit_log(action, created_at);

-- View: Current allocation status
CREATE OR REPLACE VIEW allocation_status AS
SELECT 
  'Enterprise' as category,
  600000 as total_allocation,
  COALESCE(SUM(amount), 0) as minted,
  600000 - COALESCE(SUM(amount), 0) as remaining,
  (COALESCE(SUM(amount), 0) / 600000 * 100) as percent_used
FROM earnings_ledger WHERE user_type = 'enterprise'
UNION ALL
SELECT 
  'Business' as category,
  200000 as total_allocation,
  COALESCE(SUM(amount), 0) as minted,
  200000 - COALESCE(SUM(amount), 0) as remaining,
  (COALESCE(SUM(amount), 0) / 200000 * 100) as percent_used
FROM earnings_ledger WHERE user_type = 'business'
UNION ALL
SELECT 
  'Student' as category,
  100000 as total_allocation,
  COALESCE(SUM(amount), 0) as minted,
  100000 - COALESCE(SUM(amount), 0) as remaining,
  (COALESCE(SUM(amount), 0) / 100000 * 100) as percent_used
FROM earnings_ledger WHERE user_type = 'student';

GRANT ALL PRIVILEGES ON earnings_ledger TO azora_user;
GRANT ALL PRIVILEGES ON pool_statistics TO azora_user;
GRANT ALL PRIVILEGES ON audit_log TO azora_user;
GRANT SELECT ON allocation_status TO azora_user;
