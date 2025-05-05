-- Create editor_analytics table to track editor usage
create table if not exists public.editor_analytics (
  id uuid default gen_random_uuid() primary key,
  action text not null,
  page_id uuid references public.pages(id) on delete cascade,
  user_email text not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.editor_analytics enable row level security;

-- Allow admins to view analytics
create policy "Allow admins to view analytics"
  on public.editor_analytics
  for select
  to authenticated
  using (
    exists (
      select 1 from public.admins
      where email = auth.jwt()->>'email'
    )
  );

-- Allow admins to insert analytics
create policy "Allow admins to insert analytics"
  on public.editor_analytics
  for insert
  to authenticated
  with check (
    exists (
      select 1 from public.admins
      where email = auth.jwt()->>'email'
    )
  );

-- Add indexes
create index if not exists idx_editor_analytics_page_id on public.editor_analytics(page_id);
create index if not exists idx_editor_analytics_user_email on public.editor_analytics(user_email);
create index if not exists idx_editor_analytics_created_at on public.editor_analytics(created_at);
