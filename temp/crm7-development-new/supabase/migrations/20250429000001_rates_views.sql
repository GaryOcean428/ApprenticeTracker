-- Create a view to simplify rate template queries with calculated data
CREATE OR REPLACE VIEW "public"."rate_templates_summary" 
WITH (security_invoker=on) 
AS
SELECT 
    rt.*,
    COUNT(rc.id) AS calculation_count,
    MAX(rc.created_at) AS last_calculation_date,
    AVG(rc.rate) AS average_rate
FROM 
    "public"."rate_templates" rt
LEFT JOIN 
    "public"."rate_calculations" rc ON rt.id = rc.template_id
GROUP BY 
    rt.id;

-- Create a view for analytics data
CREATE OR REPLACE VIEW "public"."rate_analytics" 
WITH (security_invoker=on) 
AS
SELECT 
    rt.org_id,
    COUNT(rt.id) AS total_templates,
    COUNT(CASE WHEN rt.status = 'active' THEN 1 END) AS active_templates,
    AVG(rt.baseRate) AS average_base_rate,
    AVG(rt.baseMargin) AS average_margin,
    COUNT(rc.id) AS total_calculations
FROM 
    "public"."rate_templates" rt
LEFT JOIN 
    "public"."rate_calculations" rc ON rt.id = rc.template_id
GROUP BY 
    rt.org_id;

-- Add appropriate access policies
CREATE POLICY "Enable read access for authenticated users"
ON "public"."rate_templates_summary"
AS permissive
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable read access for authenticated users"
ON "public"."rate_analytics"
AS permissive
FOR SELECT
TO authenticated
USING (true);
