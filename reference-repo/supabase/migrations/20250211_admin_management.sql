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

-- Update existing policies to check admin table
drop policy if exists "Allow admin to manage pages" on public.pages;
drop policy if exists "Allow admin to manage schema updates" on public.schema_updates;

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

create policy "Allow admins to manage schema updates"
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
