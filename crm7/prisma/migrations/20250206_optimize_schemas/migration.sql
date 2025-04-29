-- CreateIndexes for frequently accessed fields
CREATE INDEX IF NOT EXISTS "idx_opportunities_org_id" ON "public"."opportunities" ("org_id");
CREATE INDEX IF NOT EXISTS "idx_opportunities_user_id" ON "public"."opportunities" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_opportunities_status" ON "public"."opportunities" ("status");

-- Add composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS "idx_opportunities_org_status" ON "public"."opportunities" ("org_id", "status");
CREATE INDEX IF NOT EXISTS "idx_leads_org_status" ON "public"."leads" ("org_id", "status");

-- Add indexes for chat_threads
CREATE INDEX IF NOT EXISTS "idx_chat_threads_user_id" ON "public"."chat_threads" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_chat_threads_org_id" ON "public"."chat_threads" ("org_id");

-- Add indexes for placements
CREATE INDEX IF NOT EXISTS "idx_placements_job_id" ON "public"."placements" ("job_id");
CREATE INDEX IF NOT EXISTS "idx_placements_employee_id" ON "public"."placements" ("employee_id");
CREATE INDEX IF NOT EXISTS "idx_placements_status" ON "public"."placements" ("status");

-- Add indexes for organizations
CREATE INDEX IF NOT EXISTS "idx_organizations_parent_org_id" ON "public"."organizations" ("parent_org_id");
CREATE INDEX IF NOT EXISTS "idx_organizations_is_gto" ON "public"."organizations" ("is_gto");

-- Add indexes for training_contracts
CREATE INDEX IF NOT EXISTS "idx_training_contracts_employee_id" ON "public"."training_contracts" ("employee_id");
CREATE INDEX IF NOT EXISTS "idx_training_contracts_host_employer_id" ON "public"."training_contracts" ("host_employer_id");
CREATE INDEX IF NOT EXISTS "idx_training_contracts_gto_id" ON "public"."training_contracts" ("gto_id");

-- Add partial indexes for common filters
CREATE INDEX IF NOT EXISTS "idx_active_opportunities" ON "public"."opportunities" ("org_id") WHERE status = 'active';
CREATE INDEX IF NOT EXISTS "idx_active_placements" ON "public"."placements" ("org_id") WHERE status = 'active';

-- Add GiST index for text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS "idx_organizations_name_trgm" ON "public"."organizations" USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "idx_leads_name_trgm" ON "public"."leads" USING gin (name gin_trgm_ops);

-- Add foreign key constraints where missing
ALTER TABLE "public"."opportunities" 
ADD CONSTRAINT "fk_opportunities_org_id" 
FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."leads" 
ADD CONSTRAINT "fk_leads_org_id" 
FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add check constraints for data integrity
ALTER TABLE "public"."opportunities" 
ADD CONSTRAINT "check_opportunity_value_positive" 
CHECK (value >= 0);

ALTER TABLE "public"."placements" 
ADD CONSTRAINT "check_placement_dates" 
CHECK (start_date <= end_date);

-- Create materialized view for common analytics queries
CREATE MATERIALIZED VIEW IF NOT EXISTS "public"."mv_opportunity_analytics" AS
SELECT 
    org_id,
    status,
    COUNT(*) as opportunity_count,
    SUM(value) as total_value,
    AVG(value) as avg_value
FROM "public"."opportunities"
GROUP BY org_id, status;

CREATE UNIQUE INDEX IF NOT EXISTS "idx_mv_opportunity_analytics" 
ON "public"."mv_opportunity_analytics" (org_id, status);

-- Add function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_opportunity_analytics()
RETURNS trigger AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY "public"."mv_opportunity_analytics";
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to refresh materialized view
DROP TRIGGER IF EXISTS refresh_opportunity_analytics_trigger ON "public"."opportunities";
CREATE TRIGGER refresh_opportunity_analytics_trigger
AFTER INSERT OR UPDATE OR DELETE ON "public"."opportunities"
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_opportunity_analytics();
