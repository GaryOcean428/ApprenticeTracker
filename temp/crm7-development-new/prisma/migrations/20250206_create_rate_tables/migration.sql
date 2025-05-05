-- Create rate management tables
CREATE TABLE IF NOT EXISTS "public"."rate_templates" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "description" TEXT,
    "org_id" UUID NOT NULL,
    "award_code" TEXT NOT NULL,
    "classification" TEXT NOT NULL,
    "effective_from" TIMESTAMPTZ NOT NULL,
    "effective_to" TIMESTAMPTZ,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "public"."rate_base_values" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "template_id" UUID NOT NULL,
    "category" TEXT NOT NULL,
    "value" DECIMAL(10,4) NOT NULL,
    "unit" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("template_id") REFERENCES "public"."rate_templates"("id") ON DELETE CASCADE
);

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

CREATE TABLE IF NOT EXISTS "public"."timesheet_entries" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "worker_id" UUID NOT NULL,
    "host_org_id" UUID NOT NULL,
    "date" TIMESTAMPTZ NOT NULL,
    "hours_worked" DECIMAL(10,2) NOT NULL,
    "rate_type" TEXT NOT NULL,
    "rate_amount" DECIMAL(10,4) NOT NULL,
    "total_amount" DECIMAL(10,4) NOT NULL,
    "status" TEXT NOT NULL,
    "approved_at" TIMESTAMPTZ,
    "approved_by" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "public"."billing_cycles" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "host_org_id" UUID NOT NULL,
    "start_date" TIMESTAMPTZ NOT NULL,
    "end_date" TIMESTAMPTZ NOT NULL,
    "status" TEXT NOT NULL,
    "total_hours" DECIMAL(10,2) NOT NULL,
    "total_amount" DECIMAL(10,4) NOT NULL,
    "invoice_number" TEXT,
    "invoice_date" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "public"."rate_adjustments" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "worker_id" UUID NOT NULL,
    "host_org_id" UUID NOT NULL,
    "adjustment_type" TEXT NOT NULL,
    "amount" DECIMAL(10,4) NOT NULL,
    "percentage" DECIMAL(10,4),
    "reason" TEXT NOT NULL,
    "effective_from" TIMESTAMPTZ NOT NULL,
    "effective_to" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "idx_rate_templates_org_id" ON "public"."rate_templates"("org_id");
CREATE INDEX IF NOT EXISTS "idx_rate_templates_award_code" ON "public"."rate_templates"("award_code");
CREATE INDEX IF NOT EXISTS "idx_rate_templates_effective_dates" ON "public"."rate_templates"("effective_from", "effective_to");

CREATE INDEX IF NOT EXISTS "idx_rate_base_values_template_id" ON "public"."rate_base_values"("template_id");
CREATE INDEX IF NOT EXISTS "idx_rate_base_values_category" ON "public"."rate_base_values"("category");

CREATE INDEX IF NOT EXISTS "idx_rate_calculations_template_id" ON "public"."rate_calculations"("template_id");
CREATE INDEX IF NOT EXISTS "idx_rate_calculations_worker_id" ON "public"."rate_calculations"("worker_id");
CREATE INDEX IF NOT EXISTS "idx_rate_calculations_host_org_id" ON "public"."rate_calculations"("host_org_id");
CREATE INDEX IF NOT EXISTS "idx_rate_calculations_effective_date" ON "public"."rate_calculations"("effective_date");

CREATE INDEX IF NOT EXISTS "idx_timesheet_entries_worker_id" ON "public"."timesheet_entries"("worker_id");
CREATE INDEX IF NOT EXISTS "idx_timesheet_entries_host_org_id" ON "public"."timesheet_entries"("host_org_id");
CREATE INDEX IF NOT EXISTS "idx_timesheet_entries_date" ON "public"."timesheet_entries"("date");
CREATE INDEX IF NOT EXISTS "idx_timesheet_entries_status" ON "public"."timesheet_entries"("status");

CREATE INDEX IF NOT EXISTS "idx_billing_cycles_host_org_id" ON "public"."billing_cycles"("host_org_id");
CREATE INDEX IF NOT EXISTS "idx_billing_cycles_dates" ON "public"."billing_cycles"("start_date", "end_date");
CREATE INDEX IF NOT EXISTS "idx_billing_cycles_status" ON "public"."billing_cycles"("status");

CREATE INDEX IF NOT EXISTS "idx_rate_adjustments_worker_id" ON "public"."rate_adjustments"("worker_id");
CREATE INDEX IF NOT EXISTS "idx_rate_adjustments_host_org_id" ON "public"."rate_adjustments"("host_org_id");
CREATE INDEX IF NOT EXISTS "idx_rate_adjustments_effective_dates" ON "public"."rate_adjustments"("effective_from", "effective_to");
