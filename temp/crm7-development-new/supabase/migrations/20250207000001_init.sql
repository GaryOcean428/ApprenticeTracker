-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create roles enum
CREATE TYPE public.user_role AS ENUM ('admin', 'dev', 'user');

-- Create profiles table with role
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE,
  email text,
  role user_role DEFAULT 'user'::user_role,
  can_manage_schema boolean DEFAULT false,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE(email)
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Only admins can insert profiles" ON public.profiles
  FOR INSERT WITH CHECK (
    auth.jwt() ->> 'role' = 'admin'
    OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to promote user to dev
CREATE OR REPLACE FUNCTION public.promote_to_dev(target_user_email text)
RETURNS void AS $$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only admins can promote users to dev role';
  END IF;

  UPDATE public.profiles
  SET role = 'dev', can_manage_schema = true
  WHERE email = target_user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create schema_changes table to track changes
CREATE TABLE IF NOT EXISTS public.schema_changes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_by uuid REFERENCES public.profiles(id),
  change_type text NOT NULL,
  table_name text,
  column_name text,
  sql_statement text NOT NULL,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on schema_changes
ALTER TABLE public.schema_changes ENABLE ROW LEVEL SECURITY;

-- Only devs and admins can view schema changes
CREATE POLICY "Only devs and admins can view schema changes" ON public.schema_changes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND (role = 'admin' OR (role = 'dev' AND can_manage_schema = true))
    )
  );

-- Function to safely execute schema changes
CREATE OR REPLACE FUNCTION public.execute_schema_change(
  change_type text,
  table_name text,
  column_name text,
  sql_statement text
)
RETURNS uuid AS $$
DECLARE
  change_id uuid;
BEGIN
  -- Check if user has permission
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND (role = 'admin' OR (role = 'dev' AND can_manage_schema = true))
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins and authorized devs can modify schema';
  END IF;

  -- Record the change
  INSERT INTO public.schema_changes (created_by, change_type, table_name, column_name, sql_statement)
  VALUES (auth.uid(), change_type, table_name, column_name, sql_statement)
  RETURNING id INTO change_id;

  -- Execute the change
  EXECUTE sql_statement;

  RETURN change_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
