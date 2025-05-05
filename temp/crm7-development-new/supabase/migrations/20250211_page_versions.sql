-- Create page_versions table to store version history
create table if not exists public.page_versions (
  id uuid default gen_random_uuid() primary key,
  page_id uuid references public.pages(id) on delete cascade,
  content jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_by text not null,
  restored_at timestamp with time zone,
  restored_by text
);

-- Enable RLS
alter table public.page_versions enable row level security;

-- Allow admins to manage page versions
create policy "Allow admins to manage page versions"
  on public.page_versions
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

-- Add indexes
create index if not exists idx_page_versions_page_id on public.page_versions(page_id);
create index if not exists idx_page_versions_created_at on public.page_versions(created_at);
