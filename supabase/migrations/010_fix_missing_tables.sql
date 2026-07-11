-- Idempotent repair migration for existing Tiki Taka databases. Never deletes data.
create extension if not exists pgcrypto;

create table if not exists public.profiles (id uuid primary key references auth.users(id) on delete cascade, email text, full_name text, role text not null default 'provider', created_at timestamptz not null default now());
create table if not exists public.categories (id uuid primary key default gen_random_uuid(), name text not null, slug text unique not null, description text, image_url text, active boolean not null default true, created_at timestamptz not null default now());
create table if not exists public.providers (id uuid primary key default gen_random_uuid(), user_id uuid references auth.users(id) on delete set null, category_id uuid references public.categories(id) on delete set null, business_name text not null, slug text unique not null, description text, zone text, city text default 'Buenos Aires', province text default 'Buenos Aires', address text, whatsapp text, email text, price_from numeric, rating numeric not null default 0, reviews_count int not null default 0, verified boolean not null default false, featured boolean not null default false, published boolean not null default false, status text not null default 'pending', cover_image text, logo text, schedule text, coverage text, documents text[] not null default '{}', created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.provider_images (id uuid primary key default gen_random_uuid(), provider_id uuid not null references public.providers(id) on delete cascade, image_url text not null, sort_order int not null default 0, created_at timestamptz not null default now());
create table if not exists public.provider_services (id uuid primary key default gen_random_uuid(), provider_id uuid not null references public.providers(id) on delete cascade, title text not null, description text, price_from numeric, created_at timestamptz not null default now());
create table if not exists public.provider_requests (id uuid primary key default gen_random_uuid(), business_name text not null, category text, zone text, whatsapp text, email text, message text, status text not null default 'pending', verified boolean not null default false, featured boolean not null default false, created_at timestamptz not null default now());
create table if not exists public.reviews (id uuid primary key default gen_random_uuid(), provider_id uuid not null references public.providers(id) on delete cascade, reviewer_name text not null, reviewer_avatar text, rating int not null, comment text, created_at timestamptz not null default now());
create table if not exists public.favorites (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, provider_id uuid not null references public.providers(id) on delete cascade, created_at timestamptz not null default now(), unique(user_id, provider_id));

alter table public.providers add column if not exists status text not null default 'pending';
alter table public.providers add column if not exists published boolean not null default false;
alter table public.providers add column if not exists verified boolean not null default false;
alter table public.providers add column if not exists featured boolean not null default false;
alter table public.reviews add column if not exists status text not null default 'approved';
alter table public.reviews add column if not exists published boolean not null default true;

create table if not exists public.contact_events (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.providers(id) on delete cascade,
  source text not null,
  page text,
  created_at timestamptz not null default now()
);
create index if not exists contact_events_provider_id_idx on public.contact_events(provider_id);
create index if not exists contact_events_created_at_idx on public.contact_events(created_at desc);
create index if not exists reviews_moderation_idx on public.reviews(published, status);

alter table public.contact_events enable row level security;
create or replace function public.is_admin() returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;
drop policy if exists "providers read own contact events" on public.contact_events;
create policy "providers read own contact events" on public.contact_events for select to authenticated using (exists (select 1 from public.providers p where p.id = provider_id and p.user_id = auth.uid()));
drop policy if exists "admins manage contact events" on public.contact_events;
create policy "admins manage contact events" on public.contact_events for all to authenticated using (public.is_admin()) with check (public.is_admin());

grant select on public.contact_events to authenticated;
revoke insert, update, delete on public.contact_events from anon, authenticated;
grant all on public.contact_events to service_role;
