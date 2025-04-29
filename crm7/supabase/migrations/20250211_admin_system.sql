-- Create pages table to store page content
create table if not exists public.pages (
  id uuid default gen_random_uuid() primary key,
  path text not null unique,
  content jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create schema_updates table to track schema changes
create table if not exists public.schema_updates (
  id uuid default gen_random_uuid() primary key,
  table_name text not null,
  fields jsonb not null,
  status text not null default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create admins table
create table if not exists public.admins (
  id uuid default gen_random_uuid() primary key,
  email text not null unique,
  role text not null default 'editor',
  added_by text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint role_check check (role in ('super_admin', 'editor'))
);

-- Insert the super admin
insert into public.admins (email, role, added_by)
values ('braden.lang77@gmail.com', 'super_admin', 'system')
on conflict (email) do nothing;

-- Enable RLS
alter table public.pages enable row level security;
alter table public.schema_updates enable row level security;
alter table public.admins enable row level security;

-- Only super_admin can manage other admins
create policy "Super admin can manage admins"
  on public.admins
  for all
  to authenticated
  using (
    exists (
      select 1 from public.admins
      where email = auth.jwt()->>'email'
      and role = 'super_admin'
    )
  )
  with check (
    exists (
      select 1 from public.admins
      where email = auth.jwt()->>'email'
      and role = 'super_admin'
    )
  );

-- Allow admins to manage pages
create policy "Allow admins to manage pages"
  on public.pages
  for all
  to authenticated
  using (
    exists (
      select 1 from public.admins
      where email = auth.jwt()->>'email'
    )
  )
  with check (
    exists (
      select 1 from public.admins
      where email = auth.jwt()->>'email'
    )
  );

-- Only super_admin can manage schema updates
create policy "Allow super admin to manage schema updates"
  on public.schema_updates
  for all
  to authenticated
  using (
    exists (
      select 1 from public.admins
      where email = auth.jwt()->>'email'
      and role = 'super_admin'
    )
  )
  with check (
    exists (
      select 1 from public.admins
      where email = auth.jwt()->>'email'
      and role = 'super_admin'
    )
  );

-- Add indexes
create index if not exists idx_pages_path on public.pages(path);
create index if not exists idx_schema_updates_status on public.schema_updates(status);
create index if not exists idx_admins_email on public.admins(email);
create index if not exists idx_admins_role on public.admins(role);
