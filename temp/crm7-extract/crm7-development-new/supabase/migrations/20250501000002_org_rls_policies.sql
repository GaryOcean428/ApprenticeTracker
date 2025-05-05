-- Create organization-based RLS policies for multi-tenant data security

-- Helper function to check if a user belongs to an organization
CREATE OR REPLACE FUNCTION public.user_belongs_to_organization(org_id uuid)
RETURNS boolean AS $$
BEGIN
  -- This assumes you have a user_organizations junction table
  -- Modify this query according to your actual schema
  RETURN EXISTS (
    SELECT 1
    FROM user_organizations
    WHERE user_id = auth.uid() AND organization_id = org_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get user's organizations
CREATE OR REPLACE FUNCTION public.get_user_organizations()
RETURNS SETOF uuid AS $$
BEGIN
  -- This returns all organizations a user belongs to
  -- Modify according to your schema
  RETURN QUERY
  SELECT organization_id
  FROM user_organizations
  WHERE user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS for app_opportunities
CREATE POLICY "Users can view their organization's opportunities"
ON public.app_opportunities
FOR SELECT
TO authenticated
USING (user_belongs_to_organization(org_id));

CREATE POLICY "Users can manage their organization's opportunities"
ON public.app_opportunities
FOR ALL
TO authenticated
USING (user_belongs_to_organization(org_id));

-- RLS for app_organizations (more restrictive)
CREATE POLICY "Users can view organizations they belong to"
ON public.app_organizations
FOR SELECT
TO authenticated
USING (id IN (SELECT * FROM get_user_organizations()));

CREATE POLICY "Admins can manage organizations"
ON public.app_organizations
FOR ALL
TO authenticated
USING (
  -- This assumes you have a user_roles table or similar
  -- Modify according to your schema
  EXISTS (
    SELECT 1
    FROM user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- RLS for app_leads
CREATE POLICY "Users can view their organization's leads"
ON public.app_leads
FOR SELECT
TO authenticated
USING (user_belongs_to_organization(org_id));

CREATE POLICY "Users can manage their organization's leads"
ON public.app_leads
FOR ALL
TO authenticated
USING (user_belongs_to_organization(org_id));
