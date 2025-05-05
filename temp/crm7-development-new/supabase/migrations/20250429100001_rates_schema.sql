-- Extension for PostgreSQL enhancements
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Rate Templates Table
CREATE TABLE IF NOT EXISTS rate_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  name VARCHAR(255) NOT NULL,
  template_type VARCHAR(50) NOT NULL CHECK (template_type IN ('hourly', 'daily', 'fixed')),
  description TEXT,
  base_rate NUMERIC(10, 2) NOT NULL,
  base_margin NUMERIC(10, 2) NOT NULL,
  super_rate NUMERIC(10, 2) NOT NULL,
  leave_loading NUMERIC(10, 2) NOT NULL,
  workers_comp_rate NUMERIC(10, 2) NOT NULL,
  payroll_tax_rate NUMERIC(10, 2) NOT NULL,
  training_cost_rate NUMERIC(10, 2) NOT NULL,
  other_costs_rate NUMERIC(10, 2) NOT NULL,
  casual_loading NUMERIC(10, 2) NOT NULL,
  funding_offset NUMERIC(10, 2) DEFAULT 0.00,
  effective_from TIMESTAMP WITH TIME ZONE NOT NULL,
  effective_to TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived', 'deleted')),
  version INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  metadata JSONB DEFAULT '{}'::JSONB,
  CONSTRAINT date_range_check CHECK (effective_to IS NULL OR effective_from < effective_to)
);

-- Rate Template History Table
CREATE TABLE IF NOT EXISTS rate_template_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES rate_templates(id),
  org_id UUID NOT NULL REFERENCES organizations(id),
  changes JSONB NOT NULL,
  previous_status VARCHAR(50),
  new_status VARCHAR(50),
  version INT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES users(id)
);

-- Rate Calculations Table
CREATE TABLE IF NOT EXISTS rate_calculations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES rate_templates(id),
  org_id UUID NOT NULL REFERENCES organizations(id),
  base_rate NUMERIC(10, 2) NOT NULL,
  adjustments JSONB DEFAULT '{}'::JSONB,
  leave_loading_amount NUMERIC(10, 2) NOT NULL,
  training_cost_amount NUMERIC(10, 2) NOT NULL,
  other_costs_amount NUMERIC(10, 2) NOT NULL, 
  funding_offset_amount NUMERIC(10, 2) NOT NULL,
  total_rate NUMERIC(10, 2) NOT NULL,
  final_rate NUMERIC(10, 2) NOT NULL,
  metadata JSONB DEFAULT '{}'::JSONB,
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  calculated_by UUID REFERENCES users(id)
);

-- Bulk Calculations Table
CREATE TABLE IF NOT EXISTS bulk_calculations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  template_count INT DEFAULT 0,
  success_count INT DEFAULT 0,
  failed_count INT DEFAULT 0,
  results JSONB DEFAULT '[]'::JSONB,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES users(id)
);

-- Rate Activities Table
CREATE TABLE IF NOT EXISTS rate_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  user_id UUID REFERENCES users(id),
  activity_type VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  entity_id UUID NOT NULL,
  description TEXT NOT NULL,
  details JSONB DEFAULT '{}'::JSONB,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ip_address VARCHAR(50)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_rate_templates_org_id ON rate_templates(org_id);
CREATE INDEX IF NOT EXISTS idx_rate_templates_status ON rate_templates(status);
CREATE INDEX IF NOT EXISTS idx_rate_templates_effective_dates ON rate_templates(effective_from, effective_to);
CREATE INDEX IF NOT EXISTS idx_rate_template_history_template_id ON rate_template_history(template_id);
CREATE INDEX IF NOT EXISTS idx_rate_calculations_template_id ON rate_calculations(template_id);
CREATE INDEX IF NOT EXISTS idx_rate_calculations_org_id ON rate_calculations(org_id);
CREATE INDEX IF NOT EXISTS idx_bulk_calculations_org_id ON bulk_calculations(org_id);
CREATE INDEX IF NOT EXISTS idx_rate_activities_org_id ON rate_activities(org_id);
CREATE INDEX IF NOT EXISTS idx_rate_activities_entity_id ON rate_activities(entity_id);
CREATE INDEX IF NOT EXISTS idx_rate_activities_activity_type ON rate_activities(activity_type);

-- Text search index for rate template names
CREATE INDEX IF NOT EXISTS idx_rate_templates_name_trgm ON rate_templates USING GIN (name gin_trgm_ops);

-- Add row level security policies
ALTER TABLE rate_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_template_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE bulk_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_activities ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY rate_templates_org_policy ON rate_templates
  USING (org_id = current_setting('app.current_org_id')::UUID);

CREATE POLICY rate_template_history_org_policy ON rate_template_history
  USING (org_id = current_setting('app.current_org_id')::UUID);

CREATE POLICY rate_calculations_org_policy ON rate_calculations
  USING (org_id = current_setting('app.current_org_id')::UUID);

CREATE POLICY bulk_calculations_org_policy ON bulk_calculations
  USING (org_id = current_setting('app.current_org_id')::UUID);

CREATE POLICY rate_activities_org_policy ON rate_activities
  USING (org_id = current_setting('app.current_org_id')::UUID);
