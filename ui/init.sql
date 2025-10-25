-- Create tables used by economic-growth-service
CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  from_account TEXT,
  to_account TEXT,
  amount NUMERIC NOT NULL,
  metadata JSONB,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ubi_rates (
  id SERIAL PRIMARY KEY,
  rate NUMERIC NOT NULL,
  effective_date TIMESTAMPTZ NOT NULL
);

-- Optional: insert default ubi rate
INSERT INTO ubi_rates (rate, effective_date)
SELECT 1.0, NOW()
WHERE NOT EXISTS (SELECT 1 FROM ubi_rates);
