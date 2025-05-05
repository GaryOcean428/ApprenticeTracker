-- Ensure RLS is enabled on all application tables

-- Enable RLS on core app tables
-- Using standard SQL syntax for compatibility
ALTER TABLE public.app_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_leads ENABLE ROW LEVEL SECURITY;

-- Enable RLS on rate tables
ALTER TABLE public.rate_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_base_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timesheet_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_adjustments ENABLE ROW LEVEL SECURITY;
