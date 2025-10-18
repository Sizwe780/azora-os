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
