-- Function to calculate hourly rate from annual amount
CREATE OR REPLACE FUNCTION calculate_hourly_rate(annual_amount DECIMAL, hours_per_year INTEGER)
RETURNS DECIMAL AS $$
BEGIN
    RETURN annual_amount / hours_per_year;
END;
$$ LANGUAGE plpgsql;

-- Migrate existing pay rates to rate templates with detailed calculations
INSERT INTO rate_calculations (
    id, template_id, worker_id, host_org_id,
    effective_date, base_rate,
    -- Leave entitlements
    annual_leave_days, annual_leave_cost,
    annual_leave_loading_percent, annual_leave_loading_cost,
    sick_leave_days, sick_leave_cost,
    public_holidays_days, public_holidays_cost,
    -- Training and equipment
    training_weeks, training_cost,
    study_costs_annual, study_costs_hourly,
    protective_equipment_annual, protective_equipment_hourly,
    -- Statutory costs
    superannuation_percent, superannuation_cost,
    workers_comp_percent, workers_comp_cost,
    payroll_tax_percent, payroll_tax_cost,
    -- Additional costs
    financing_cost, admin_cost, other_costs, fixed_costs,
    -- Totals and margins
    total_cost, markup_percent, margin_percent,
    gross_profit, charge_rate,
    billing_model, hours_per_year
)
SELECT
    gen_random_uuid(),
    rt.id,
    '00000000-0000-0000-0000-000000000000'::uuid, -- Default worker_id
    '00000000-0000-0000-0000-000000000000'::uuid, -- Default host_org_id
    CURRENT_DATE,
    pr.hourly_rate,
    -- Leave entitlements
    20, -- annual_leave_days
    pr.hourly_rate * 0.0769, -- annual_leave_cost (4 weeks / 52 weeks)
    17.50, -- annual_leave_loading_percent
    pr.hourly_rate * 0.0769 * 0.175, -- annual_leave_loading_cost
    10, -- sick_leave_days
    pr.hourly_rate * 0.0385, -- sick_leave_cost (10 days / 260 work days)
    10, -- public_holidays_days
    pr.hourly_rate * 0.0385, -- public_holidays_cost
    -- Training and equipment
    5, -- training_weeks
    pr.hourly_rate * 0.0962, -- training_cost (5 weeks / 52 weeks)
    850.00, -- study_costs_annual
    calculate_hourly_rate(850.00, 1976), -- study_costs_hourly
    300.00, -- protective_equipment_annual
    calculate_hourly_rate(300.00, 1976), -- protective_equipment_hourly
    -- Statutory costs
    11.50, -- superannuation_percent
    pr.hourly_rate * 0.115, -- superannuation_cost
    4.70, -- workers_comp_percent
    pr.hourly_rate * 0.047, -- workers_comp_cost
    4.85, -- payroll_tax_percent
    pr.hourly_rate * 0.0485, -- payroll_tax_cost
    -- Additional costs
    0.00, -- financing_cost
    0.00, -- admin_cost
    0.00, -- other_costs
    0.00, -- fixed_costs
    -- Calculate total cost (sum of all costs)
    pr.hourly_rate + 
    (pr.hourly_rate * 0.0769) + -- annual leave
    (pr.hourly_rate * 0.0769 * 0.175) + -- leave loading
    (pr.hourly_rate * 0.0385) + -- sick leave
    (pr.hourly_rate * 0.0385) + -- public holidays
    (pr.hourly_rate * 0.0962) + -- training
    calculate_hourly_rate(850.00, 1976) + -- study costs
    calculate_hourly_rate(300.00, 1976) + -- protective equipment
    (pr.hourly_rate * 0.115) + -- super
    (pr.hourly_rate * 0.047) + -- workers comp
    (pr.hourly_rate * 0.0485), -- payroll tax
    17.165, -- markup_percent
    14.603, -- margin_percent
    -- Calculate gross profit
    (pr.hourly_rate * 0.14603), -- gross_profit
    -- Calculate charge rate
    (pr.hourly_rate + 
    (pr.hourly_rate * 0.0769) + 
    (pr.hourly_rate * 0.0769 * 0.175) + 
    (pr.hourly_rate * 0.0385) + 
    (pr.hourly_rate * 0.0385) + 
    (pr.hourly_rate * 0.0962) + 
    calculate_hourly_rate(850.00, 1976) + 
    calculate_hourly_rate(300.00, 1976) + 
    (pr.hourly_rate * 0.115) + 
    (pr.hourly_rate * 0.047) + 
    (pr.hourly_rate * 0.0485)) * 1.17165, -- charge_rate with markup
    'standard', -- billing_model
    1976 -- hours_per_year
FROM pay_rates pr
JOIN award_classifications ac ON pr.classification_id = ac.id
JOIN awards a ON ac.award_id = a.id
JOIN rate_templates rt ON rt.award_code = a.code 
    AND rt.classification = ac.fair_work_level_code
WHERE pr.is_apprentice_rate = true;

-- Create materialized view for rate analytics with detailed breakdowns
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
