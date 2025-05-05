-- Create tables with app-specific prefix
CREATE TABLE IF NOT EXISTS "public"."app_opportunities" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "value" DECIMAL NOT NULL,
    "status" TEXT NOT NULL,
    "org_id" UUID NOT NULL,
    "user_id" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "public"."app_organizations" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "is_gto" BOOLEAN DEFAULT false,
    "parent_org_id" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "public"."app_leads" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "email" TEXT,
    "status" TEXT NOT NULL,
    "org_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key constraints
ALTER TABLE "public"."app_opportunities" 
ADD CONSTRAINT "fk_app_opportunities_org_id" 
FOREIGN KEY ("org_id") REFERENCES "public"."app_organizations"("id") ON DELETE CASCADE;

ALTER TABLE "public"."app_leads" 
ADD CONSTRAINT "fk_app_leads_org_id" 
FOREIGN KEY ("org_id") REFERENCES "public"."app_organizations"("id") ON DELETE CASCADE;

ALTER TABLE "public"."app_organizations" 
ADD CONSTRAINT "fk_app_organizations_parent_org_id" 
FOREIGN KEY ("parent_org_id") REFERENCES "public"."app_organizations"("id") ON DELETE SET NULL;

-- Add indexes
CREATE INDEX IF NOT EXISTS "idx_app_opportunities_org_id" ON "public"."app_opportunities" ("org_id");
CREATE INDEX IF NOT EXISTS "idx_app_opportunities_user_id" ON "public"."app_opportunities" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_app_opportunities_status" ON "public"."app_opportunities" ("status");
CREATE INDEX IF NOT EXISTS "idx_app_opportunities_org_status" ON "public"."app_opportunities" ("org_id", "status");

CREATE INDEX IF NOT EXISTS "idx_app_organizations_parent_org_id" ON "public"."app_organizations" ("parent_org_id");
CREATE INDEX IF NOT EXISTS "idx_app_organizations_is_gto" ON "public"."app_organizations" ("is_gto");

CREATE INDEX IF NOT EXISTS "idx_app_leads_org_id" ON "public"."app_leads" ("org_id");
CREATE INDEX IF NOT EXISTS "idx_app_leads_status" ON "public"."app_leads" ("status");
CREATE INDEX IF NOT EXISTS "idx_app_leads_org_status" ON "public"."app_leads" ("org_id", "status");

-- Add GiST index for text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS "idx_app_organizations_name_trgm" ON "public"."app_organizations" USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "idx_app_leads_name_trgm" ON "public"."app_leads" USING gin (name gin_trgm_ops);

-- Create materialized view for opportunity analytics
CREATE MATERIALIZED VIEW IF NOT EXISTS "public"."mv_app_opportunity_analytics" AS
SELECT 
    org_id,
    status,
    COUNT(*) as opportunity_count,
    SUM(value) as total_value,
    AVG(value) as avg_value
FROM "public"."app_opportunities"
GROUP BY org_id, status;

CREATE UNIQUE INDEX IF NOT EXISTS "idx_mv_app_opportunity_analytics" 
ON "public"."mv_app_opportunity_analytics" (org_id, status);

-- Add function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_app_opportunity_analytics()
RETURNS trigger AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY "public"."mv_app_opportunity_analytics";
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to refresh materialized view
DROP TRIGGER IF EXISTS refresh_app_opportunity_analytics_trigger ON "public"."app_opportunities";
CREATE TRIGGER refresh_app_opportunity_analytics_trigger
AFTER INSERT OR UPDATE OR DELETE ON "public"."app_opportunities"
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_app_opportunity_analytics();
