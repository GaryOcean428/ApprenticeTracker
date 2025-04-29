CREATE OR REPLACE FUNCTION calculate_rate(
  template_id uuid,
  employee_id uuid,
  base_rate decimal,
  casual_loading decimal DEFAULT NULL,
  allowances jsonb DEFAULT '[]'::jsonb,
  penalties jsonb DEFAULT '[]'::jsonb
) RETURNS TABLE (
  id uuid,
  template_id uuid,
  employee_id uuid,
  base_rate decimal,
  casual_loading decimal,
  allowances jsonb,
  penalties jsonb,
  super_amount decimal,
  leave_loading_amount decimal,
  workers_comp_amount decimal,
  payroll_tax_amount decimal,
  training_cost_amount decimal,
  other_costs_amount decimal,
  funding_offset_amount decimal,
  margin_amount decimal,
  total_cost decimal,
  final_rate decimal,
  calculation_date date,
  metadata jsonb
) LANGUAGE plpgsql
AS $$
DECLARE
  v_template rate_templates%ROWTYPE;
  v_total_allowances decimal := 0;
  v_total_penalties decimal := 0;
  v_subtotal decimal;
  v_org_id uuid;
BEGIN
  -- Get the template
  SELECT * INTO v_template
  FROM rate_templates
  WHERE id = template_id
  AND is_active = true
  AND (effective_to IS NULL OR effective_to >= CURRENT_DATE)
  AND effective_from <= CURRENT_DATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Template not found or not active';
  END IF;

  -- Get organization ID from employee
  SELECT organization_id INTO v_org_id
  FROM employees
  WHERE id = employee_id;

  -- Calculate allowances total
  SELECT COALESCE(SUM((value->>'amount')::decimal), 0)
  INTO v_total_allowances
  FROM jsonb_array_elements(allowances) AS value;

  -- Calculate penalties total
  SELECT COALESCE(SUM(base_rate * (value->>'multiplier')::decimal), 0)
  INTO v_total_penalties
  FROM jsonb_array_elements(penalties) AS value;

  -- Calculate components
  v_subtotal := base_rate;

  -- Add casual loading if applicable
  IF casual_loading IS NOT NULL AND casual_loading > 0 THEN
    v_subtotal := v_subtotal * (1 + casual_loading / 100);
  END IF;

  -- Add allowances and penalties
  v_subtotal := v_subtotal + v_total_allowances + v_total_penalties;

  -- Calculate on-costs
  RETURN QUERY
  SELECT
    gen_random_uuid() AS id,
    v_template.id AS template_id,
    employee_id AS employee_id,
    base_rate AS base_rate,
    COALESCE(casual_loading, 0) AS casual_loading,
    allowances AS allowances,
    penalties AS penalties,
    ROUND((v_subtotal * v_template.super_rate / 100)::numeric, 2) AS super_amount,
    ROUND((v_subtotal * COALESCE(v_template.leave_loading, 0) / 100)::numeric, 2) AS leave_loading_amount,
    ROUND((v_subtotal * v_template.workers_comp_rate / 100)::numeric, 2) AS workers_comp_amount,
    ROUND((v_subtotal * v_template.payroll_tax_rate / 100)::numeric, 2) AS payroll_tax_amount,
    ROUND((v_subtotal * COALESCE(v_template.training_cost_rate, 0) / 100)::numeric, 2) AS training_cost_amount,
    ROUND((v_subtotal * COALESCE(v_template.other_costs_rate, 0) / 100)::numeric, 2) AS other_costs_amount,
    COALESCE(v_template.funding_offset, 0) AS funding_offset_amount,
    ROUND((
      v_subtotal * (1 + v_template.base_margin / 100) - v_subtotal
    )::numeric, 2) AS margin_amount,
    ROUND((
      v_subtotal +
      (v_subtotal * v_template.super_rate / 100) +
      (v_subtotal * COALESCE(v_template.leave_loading, 0) / 100) +
      (v_subtotal * v_template.workers_comp_rate / 100) +
      (v_subtotal * v_template.payroll_tax_rate / 100) +
      (v_subtotal * COALESCE(v_template.training_cost_rate, 0) / 100) +
      (v_subtotal * COALESCE(v_template.other_costs_rate, 0) / 100) -
      COALESCE(v_template.funding_offset, 0)
    )::numeric, 2) AS total_cost,
    ROUND((
      (
        v_subtotal +
        (v_subtotal * v_template.super_rate / 100) +
        (v_subtotal * COALESCE(v_template.leave_loading, 0) / 100) +
        (v_subtotal * v_template.workers_comp_rate / 100) +
        (v_subtotal * v_template.payroll_tax_rate / 100) +
        (v_subtotal * COALESCE(v_template.training_cost_rate, 0) / 100) +
        (v_subtotal * COALESCE(v_template.other_costs_rate, 0) / 100) -
        COALESCE(v_template.funding_offset, 0)
      ) * (1 + v_template.base_margin / 100)
    )::numeric, 2) AS final_rate,
    CURRENT_DATE AS calculation_date,
    jsonb_build_object(
      'template_type', v_template.template_type,
      'template_name', v_template.template_name,
      'org_id', v_org_id
    ) AS metadata;
END;
$$;
