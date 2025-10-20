-- Azora OS Database Schema
-- Purpose: Enable immediate monetization for students

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  github_username VARCHAR(100),
  wallet_address VARCHAR(42) UNIQUE,
  azr_balance DECIMAL(18, 8) DEFAULT 0,
  total_earned DECIMAL(18, 8) DEFAULT 0,
  student_tier VARCHAR(50) DEFAULT 'free',
  copilot_enrolled BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Azora Coin transactions
CREATE TABLE IF NOT EXISTS azr_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  type VARCHAR(50) NOT NULL, -- 'mint', 'earn', 'spend', 'transfer'
  amount DECIMAL(18, 8) NOT NULL,
  reason VARCHAR(255),
  bounty_id UUID,
  tx_hash VARCHAR(66),
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Bounties (tasks students can complete for AZR)
CREATE TABLE IF NOT EXISTS bounties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  reward_azr DECIMAL(18, 8) NOT NULL,
  category VARCHAR(100),
  difficulty VARCHAR(50),
  requirements JSONB,
  max_completions INT DEFAULT 1,
  current_completions INT DEFAULT 0,
  expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Bounty completions (proof of work)
CREATE TABLE IF NOT EXISTS bounty_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bounty_id UUID REFERENCES bounties(id),
  user_id UUID REFERENCES users(id),
  proof_url TEXT,
  proof_type VARCHAR(50),
  verification_status VARCHAR(50) DEFAULT 'pending',
  azr_awarded DECIMAL(18, 8),
  completed_at TIMESTAMP DEFAULT NOW(),
  verified_at TIMESTAMP,
  UNIQUE(bounty_id, user_id)
);

-- Copilot activity tracking
CREATE TABLE IF NOT EXISTS copilot_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  activity_type VARCHAR(100), -- 'code_completion', 'code_review', 'learning_path'
  details JSONB,
  azr_earned DECIMAL(18, 8),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert starter bounties
INSERT INTO bounties (title, description, reward_azr, category, difficulty) VALUES
('Complete Your First Copilot Tutorial', 'Finish the GitHub Copilot onboarding tutorial', 50.00, 'learning', 'beginner'),
('Write 10 Functions with Copilot', 'Use Copilot to write 10 unique functions in any language', 100.00, 'coding', 'beginner'),
('Code Review Challenge', 'Review and improve 5 code snippets using Copilot suggestions', 150.00, 'review', 'intermediate'),
('Build a REST API', 'Create a REST API with Copilot assistance (min 5 endpoints)', 500.00, 'project', 'intermediate'),
('Contribute to Open Source', 'Make a PR to an open source project using Copilot', 1000.00, 'contribution', 'advanced')
ON CONFLICT DO NOTHING;

-- Create indexes for performance
CREATE INDEX idx_users_wallet ON users(wallet_address);
CREATE INDEX idx_transactions_user ON azr_transactions(user_id);
CREATE INDEX idx_bounties_active ON bounties(is_active, expires_at);
CREATE INDEX idx_completions_user ON bounty_completions(user_id);
CREATE INDEX idx_copilot_user ON copilot_activities(user_id);

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO azora_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO azora_admin;
