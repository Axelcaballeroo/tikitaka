-- Incremental, idempotent update for an existing Tiki Taka database.
-- Safe to run from Supabase SQL Editor; it does not delete existing rows.

-- 1. Reviews moderation
alter table public.reviews add column if not exists status text not null default 'approved';
alter table public.reviews add column if not exists published boolean not null default true;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'reviews_status_check') then
    alter table public.reviews add constraint reviews_status_check check (status in ('pending', 'approved', 'hidden'));
  end if;
end $$;

-- 2. Contact events
create table if not exists public.contact_events (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.providers(id) on delete cascade,
  source text not null,
  page text,
  created_at timestamptz not null default now()
);

-- 3. Indexes
create index if not exists reviews_moderation_idx on public.reviews(published, status);
create index if not exists contact_events_provider_id_idx on public.contact_events(provider_id);
create index if not exists contact_events_created_at_idx on public.contact_events(created_at desc);

-- 4. RLS policies
alter table public.contact_events enable row level security;
create or replace function public.is_admin() returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;
drop policy if exists "providers read own contact events" on public.contact_events;
create policy "providers read own contact events" on public.contact_events for select to authenticated
using (exists (select 1 from public.providers p where p.id = provider_id and p.user_id = auth.uid()));
drop policy if exists "admins manage contact events" on public.contact_events;
create policy "admins manage contact events" on public.contact_events for all to authenticated
using (public.is_admin()) with check (public.is_admin());
-- Deliberately no public INSERT policy. POST /api/contact-events validates input server-side.

-- 5. Grants necesarios
grant select on public.contact_events to authenticated;
revoke insert, update, delete on public.contact_events from anon, authenticated;
grant all on public.contact_events to service_role;
