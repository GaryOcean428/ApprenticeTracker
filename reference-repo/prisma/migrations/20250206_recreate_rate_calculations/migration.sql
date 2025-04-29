-- Drop existing table and related objects
DROP TRIGGER IF EXISTS refresh_rate_analytics_trigger ON rate_calculations;
DROP MATERIALIZED VIEW IF EXISTS mv_rate_analytics;
DROP TABLE IF EXISTS rate_calculations;

-- Recreate rate_calculations table with updated schema
CREATE TABLE IF NOT EXISTS "public"."rate_calculations" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "template_id" UUID NOT NULL,
    "worker_id" UUID NOT NULL,
    "host_org_id" UUID NOT NULL,
    "effective_date" TIMESTAMPTZ NOT NULL,
    "base_rate" DECIMAL(10,4) NOT NULL,
    -- Leave entitlements
    "annual_leave_days" INTEGER NOT NULL DEFAULT 20,
    "annual_leave_cost" DECIMAL(10,4) NOT NULL,
    "annual_leave_loading_percent" DECIMAL(5,2) NOT NULL DEFAULT 17.50,
    "annual_leave_loading_cost" DECIMAL(10,4) NOT NULL,
    "sick_leave_days" INTEGER NOT NULL DEFAULT 10,
    "sick_leave_cost" DECIMAL(10,4) NOT NULL,
    "public_holidays_days" INTEGER NOT NULL DEFAULT 10,
    "public_holidays_cost" DECIMAL(10,4) NOT NULL,
    -- Training and equipment
    "training_weeks" INTEGER NOT NULL DEFAULT 5,
    "training_cost" DECIMAL(10,4) NOT NULL,
    "study_costs_annual" DECIMAL(10,2) NOT NULL DEFAULT 850.00,
    "study_costs_hourly" DECIMAL(10,4) NOT NULL,
    "protective_equipment_annual" DECIMAL(10,2) NOT NULL DEFAULT 300.00,
    "protective_equipment_hourly" DECIMAL(10,4) NOT NULL,
    -- Statutory costs
    "superannuation_percent" DECIMAL(5,2) NOT NULL DEFAULT 11.50,
    "superannuation_cost" DECIMAL(10,4) NOT NULL,
    "workers_comp_percent" DECIMAL(5,2) NOT NULL DEFAULT 4.70,
    "workers_comp_cost" DECIMAL(10,4) NOT NULL,
    "payroll_tax_percent" DECIMAL(5,2) NOT NULL DEFAULT 4.85,
    "payroll_tax_cost" DECIMAL(10,4) NOT NULL,
    -- Additional costs
    "financing_cost" DECIMAL(10,4) NOT NULL DEFAULT 0,
    "admin_cost" DECIMAL(10,4) NOT NULL DEFAULT 0,
    "other_costs" DECIMAL(10,4) NOT NULL DEFAULT 0,
    "fixed_costs" DECIMAL(10,4) NOT NULL DEFAULT 0,
    -- Totals and margins
    "total_cost" DECIMAL(10,4) NOT NULL,
    "markup_percent" DECIMAL(5,2) NOT NULL,
    "margin_percent" DECIMAL(5,2) NOT NULL,
    "gross_profit" DECIMAL(10,4) NOT NULL,
    "charge_rate" DECIMAL(10,4) NOT NULL,
    -- Standard fields
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "billing_model" TEXT NOT NULL DEFAULT 'standard', -- 'standard', 'alex', '52_week'
    "hours_per_year" INTEGER NOT NULL DEFAULT 1976,  -- Standard work hours per year
    FOREIGN KEY ("template_id") REFERENCES "public"."rate_templates"("id")
);

-- Recreate indexes
CREATE INDEX IF NOT EXISTS "idx_rate_calculations_template_id" ON "public"."rate_calculations"("template_id");
CREATE INDEX IF NOT EXISTS "idx_rate_calculations_worker_id" ON "public"."rate_calculations"("worker_id");
CREATE INDEX IF NOT EXISTS "idx_rate_calculations_host_org_id" ON "public"."rate_calculations"("host_org_id");
CREATE INDEX IF NOT EXISTS "idx_rate_calculations_effective_date" ON "public"."rate_calculations"("effective_date");

-- Recreate materialized view
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_rate_analytics AS
SELECT
    rc.host_org_id,
    rt.award_code,
    rt.classification,
    COUNT(*) as worker_count,
    AVG(rc.base_rate) as avg_base_rate,
    AVG(rc.total_cost) as avg_total_cost,
    AVG(rc.charge_rate) as avg_charge_rate,
    AVG(rc.markup_percent) as avg_markup_percent,
    AVG(rc.margin_percent) as avg_margin_percent,
    AVG(rc.annual_leave_cost + rc.annual_leave_loading_cost) as avg_leave_cost,
    AVG(rc.training_cost + rc.study_costs_hourly) as avg_training_cost,
    AVG(rc.superannuation_cost + rc.workers_comp_cost + rc.payroll_tax_cost) as avg_statutory_cost,
    SUM(rc.charge_rate * rc.hours_per_year) as annual_revenue_potential
FROM rate_calculations rc
JOIN rate_templates rt ON rc.template_id = rt.id
WHERE rt.is_active = true
GROUP BY rc.host_org_id, rt.award_code, rt.classification;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_rate_analytics 
ON mv_rate_analytics (host_org_id, award_code, classification);

-- Recreate trigger function
CREATE OR REPLACE FUNCTION refresh_rate_analytics()
RETURNS trigger AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_rate_analytics;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger
CREATE TRIGGER refresh_rate_analytics_trigger
AFTER INSERT OR UPDATE OR DELETE ON rate_calculations
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_rate_analytics();
