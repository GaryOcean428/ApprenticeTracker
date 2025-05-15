CREATE TABLE IF NOT EXISTS award_update_checks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  award_code VARCHAR(20) NOT NULL,
  award_name VARCHAR(200) NOT NULL,
  check_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  current_version VARCHAR(50) NOT NULL,
  latest_version VARCHAR(50),
  update_available BOOLEAN DEFAULT FALSE NOT NULL,
  update_url VARCHAR(500),
  last_notified_date TIMESTAMP,
  status VARCHAR(20) DEFAULT 'pending' NOT NULL,
  ai_analysis TEXT,
  notification_message TEXT,
  impact_level VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS award_update_check_code_idx ON award_update_checks (award_code);
CREATE INDEX IF NOT EXISTS award_update_check_status_idx ON award_update_checks (status);