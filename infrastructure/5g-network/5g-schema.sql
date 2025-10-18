-- 5G Network Schema

CREATE TABLE IF NOT EXISTS network_slices (
  id VARCHAR(100) PRIMARY KEY,
  user_id UUID NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('eMBB', 'URLLC', 'mMTC')),
  priority VARCHAR(20) NOT NULL,
  bandwidth VARCHAR(20) NOT NULL,
  latency VARCHAR(10) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '1 hour'
);

CREATE TABLE IF NOT EXISTS edge_computing_tasks (
  id VARCHAR(100) PRIMARY KEY,
  user_id UUID NOT NULL,
  edge_node VARCHAR(50) NOT NULL,
  task_type VARCHAR(50) NOT NULL,
  input_data JSONB NOT NULL,
  output_data JSONB,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS network_quality_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  operator VARCHAR(50),
  latency NUMERIC(10,2),
  bandwidth NUMERIC(10,2),
  packet_loss NUMERIC(5,2),
  jitter NUMERIC(5,2),
  network_type VARCHAR(20),
  timestamp TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_slices_user ON network_slices(user_id, status);
CREATE INDEX idx_edge_tasks_user ON edge_computing_tasks(user_id, status);
CREATE INDEX idx_quality_timestamp ON network_quality_metrics(timestamp DESC);

GRANT ALL PRIVILEGES ON network_slices TO azora_user;
GRANT ALL PRIVILEGES ON edge_computing_tasks TO azora_user;
GRANT ALL PRIVILEGES ON network_quality_metrics TO azora_user;
