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

-- Add RLS policies
alter table public.pages enable row level security;
alter table public.schema_updates enable row level security;

-- Only allow the admin user to modify these tables
create policy "Allow admin to manage pages"
  on public.pages
  for all
  to authenticated
  using (auth.jwt()->>'email' = 'braden.lang77@gmail.com')
  with check (auth.jwt()->>'email' = 'braden.lang77@gmail.com');

create policy "Allow admin to manage schema updates"
  on public.schema_updates
  for all
  to authenticated
  using (auth.jwt()->>'email' = 'braden.lang77@gmail.com')
  with check (auth.jwt()->>'email' = 'braden.lang77@gmail.com');

-- Add indexes
create index if not exists idx_pages_path on public.pages(path);
create index if not exists idx_schema_updates_status on public.schema_updates(status);
