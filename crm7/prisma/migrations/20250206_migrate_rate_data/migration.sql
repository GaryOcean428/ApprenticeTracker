-- Migrate existing pay rates to rate templates
INSERT INTO rate_templates (
  id, name, description, org_id, award_code, classification, 
  effective_from, is_active, created_at, updated_at
)
SELECT 
  gen_random_uuid(), 
  ac.name, 
  'Migrated from legacy pay_rates - ' || ac.fair_work_level_desc,
  '00000000-0000-0000-0000-000000000000'::uuid, -- Default org_id, update as needed
  a.code,
  ac.fair_work_level_code,
  COALESCE(ac.operative_from, CURRENT_DATE),
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM pay_rates pr
JOIN award_classifications ac ON pr.classification_id = ac.id
JOIN awards a ON ac.award_id = a.id
WHERE pr.is_apprentice_rate = true;

-- Insert base rate values
INSERT INTO rate_base_values (
  id, template_id, category, value, unit, created_at, updated_at
)
SELECT
  gen_random_uuid(),
  rt.id,
  'hourly_rate',
  pr.hourly_rate,
  'hourly',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM pay_rates pr
JOIN award_classifications ac ON pr.classification_id = ac.id
JOIN awards a ON ac.award_id = a.id
JOIN rate_templates rt ON rt.award_code = a.code 
  AND rt.classification = ac.fair_work_level_code;

-- Create materialized view for rate analytics
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_rate_analytics AS
SELECT
  rt.org_id,
  rt.award_code,
  rt.classification,
  COUNT(*) as template_count,
  AVG(rbv.value) as avg_base_rate,
  MIN(rbv.value) as min_base_rate,
  MAX(rbv.value) as max_base_rate
FROM rate_templates rt
JOIN rate_base_values rbv ON rt.id = rbv.template_id
WHERE rt.is_active = true
GROUP BY rt.org_id, rt.award_code, rt.classification;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_rate_analytics 
ON mv_rate_analytics (org_id, award_code, classification);

-- Create function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_rate_analytics()
RETURNS trigger AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_rate_analytics;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to refresh materialized view
DROP TRIGGER IF EXISTS refresh_rate_analytics_trigger ON rate_calculations;
CREATE TRIGGER refresh_rate_analytics_trigger
AFTER INSERT OR UPDATE OR DELETE ON rate_calculations
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_rate_analytics();
