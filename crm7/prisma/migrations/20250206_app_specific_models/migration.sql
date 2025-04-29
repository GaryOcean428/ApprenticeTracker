-- Add indexes for opportunities
CREATE INDEX IF NOT EXISTS "idx_opportunities_org_id" ON "public"."opportunities" ("org_id");
CREATE INDEX IF NOT EXISTS "idx_opportunities_user_id" ON "public"."opportunities" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_opportunities_status" ON "public"."opportunities" ("status");
CREATE INDEX IF NOT EXISTS "idx_opportunities_org_status" ON "public"."opportunities" ("org_id", "status");

-- Add indexes for organizations
CREATE INDEX IF NOT EXISTS "idx_organizations_parent_org_id" ON "public"."organizations" ("parent_org_id");
CREATE INDEX IF NOT EXISTS "idx_organizations_is_gto" ON "public"."organizations" ("is_gto");

-- Add indexes for leads
CREATE INDEX IF NOT EXISTS "idx_leads_org_id" ON "public"."leads" ("org_id");
CREATE INDEX IF NOT EXISTS "idx_leads_status" ON "public"."leads" ("status");
CREATE INDEX IF NOT EXISTS "idx_leads_org_status" ON "public"."leads" ("org_id", "status");

-- Add GiST index for text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS "idx_organizations_name_trgm" ON "public"."organizations" USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "idx_leads_name_trgm" ON "public"."leads" USING gin (name gin_trgm_ops);

-- Create materialized view for opportunity analytics
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
