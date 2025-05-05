-- Create RLS policies for rate-related tables
-- Note: Using standard SQL syntax for compatibility with the local validator

-- Rate Templates Policies
CREATE POLICY read_rate_templates_for_org ON public.rate_templates
  FOR SELECT USING (
    organization_id IN (SELECT organization_id FROM public.user_organizations WHERE user_id = auth.uid())
  );

CREATE POLICY manage_rate_templates_for_org ON public.rate_templates
  FOR ALL USING (
    organization_id IN (SELECT organization_id FROM public.user_organizations WHERE user_id = auth.uid())
  );

-- Timesheet Entries Policies
CREATE POLICY read_own_timesheet_entries ON public.timesheet_entries
  FOR SELECT USING (
    user_id = auth.uid()
  );

CREATE POLICY manage_own_timesheet_entries ON public.timesheet_entries
  FOR ALL USING (
    user_id = auth.uid()
  );

CREATE POLICY read_team_timesheet_entries ON public.timesheet_entries
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM public.team_members
      WHERE manager_id = auth.uid() AND user_id = timesheet_entries.user_id
    )
  );

-- Rate Calculations Policy
CREATE POLICY read_rate_calculations_for_org ON public.rate_calculations
  FOR SELECT USING (
    organization_id IN (SELECT organization_id FROM public.user_organizations WHERE user_id = auth.uid())
  );
