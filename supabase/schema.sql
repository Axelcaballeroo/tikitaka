-- Tiki Taka — esquema inicial Supabase
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'provider' check (role in ('provider', 'admin')),
  created_at timestamptz not null default now()
);
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(), name text not null, slug text unique not null,
  description text, image_url text, active boolean not null default true, created_at timestamptz not null default now()
);
create table if not exists public.providers (
  id uuid primary key default gen_random_uuid(), user_id uuid references auth.users(id) on delete set null,
  category_id uuid references public.categories(id) on delete set null, business_name text not null, slug text unique not null,
  description text, zone text, city text default 'Buenos Aires', province text default 'Buenos Aires', address text,
  whatsapp text, email text, price_from numeric check (price_from is null or price_from >= 0), rating numeric not null default 0 check (rating between 0 and 5),
  reviews_count int not null default 0 check (reviews_count >= 0), verified boolean not null default false, featured boolean not null default false,
  published boolean not null default false, status text not null default 'pending' check (status in ('pending','approved','rejected')),
  cover_image text, logo text, schedule text, coverage text, documents text[] not null default '{}',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.provider_images (
  id uuid primary key default gen_random_uuid(), provider_id uuid not null references public.providers(id) on delete cascade,
  image_url text not null, sort_order int not null default 0, created_at timestamptz not null default now()
);
create table if not exists public.provider_services (
  id uuid primary key default gen_random_uuid(), provider_id uuid not null references public.providers(id) on delete cascade,
  title text not null, description text, price_from numeric, created_at timestamptz not null default now()
);
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(), provider_id uuid not null references public.providers(id) on delete cascade,
  reviewer_name text not null, reviewer_avatar text, rating int not null check (rating between 1 and 5), comment text,
  created_at timestamptz not null default now()
);
create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  provider_id uuid not null references public.providers(id) on delete cascade, created_at timestamptz not null default now(),
  unique(user_id, provider_id)
);
create table if not exists public.provider_requests (
  id uuid primary key default gen_random_uuid(), business_name text not null, category text, zone text, whatsapp text, email text,
  message text, status text not null default 'pending' check (status in ('pending','approved','rejected')),
  verified boolean not null default false, featured boolean not null default false, created_at timestamptz not null default now()
);
alter table public.reviews add column if not exists status text not null default 'approved';
alter table public.reviews add column if not exists published boolean not null default true;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'reviews_status_check') then
    alter table public.reviews add constraint reviews_status_check check (status in ('pending','approved','hidden'));
  end if;
end $$;
create table if not exists public.contact_events (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.providers(id) on delete cascade,
  source text not null,
  page text,
  created_at timestamptz not null default now()
);

create index if not exists providers_slug_idx on public.providers(slug);
create index if not exists providers_public_idx on public.providers(published, status);
create index if not exists providers_category_idx on public.providers(category_id);
create unique index if not exists providers_one_per_user_idx on public.providers(user_id) where user_id is not null;
create index if not exists requests_status_idx on public.provider_requests(status);
create index if not exists reviews_moderation_idx on public.reviews(published, status);
create index if not exists contact_events_provider_idx on public.contact_events(provider_id, created_at desc);
create index if not exists contact_events_created_idx on public.contact_events(created_at desc);
create index if not exists contact_events_provider_id_idx on public.contact_events(provider_id);
create index if not exists contact_events_created_at_idx on public.contact_events(created_at desc);

create or replace function public.set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;
drop trigger if exists providers_set_updated_at on public.providers;
create trigger providers_set_updated_at before update on public.providers for each row execute function public.set_updated_at();

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin insert into public.profiles(id,email,full_name) values(new.id,new.email,new.raw_user_meta_data->>'full_name') on conflict(id) do nothing; return new; end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.is_admin() returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.providers enable row level security;
alter table public.provider_images enable row level security;
alter table public.provider_services enable row level security;
alter table public.reviews enable row level security;
alter table public.favorites enable row level security;
alter table public.provider_requests enable row level security;
alter table public.contact_events enable row level security;

drop policy if exists "active categories are public" on public.categories;
create policy "active categories are public" on public.categories for select using (active = true or public.is_admin());
drop policy if exists "published providers are public" on public.providers;
create policy "published providers are public" on public.providers for select using ((published = true and status = 'approved') or user_id = auth.uid() or public.is_admin());
drop policy if exists "providers update own listing" on public.providers;
create policy "providers update own listing" on public.providers for update using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());
drop policy if exists "providers create own listing" on public.providers;
create policy "providers create own listing" on public.providers for insert with check (user_id = auth.uid() or public.is_admin());
drop policy if exists "provider children public read" on public.provider_images;
create policy "provider children public read" on public.provider_images for select using (exists(select 1 from public.providers p where p.id = provider_id and (p.published = true and p.status = 'approved' or p.user_id = auth.uid() or public.is_admin())));
drop policy if exists "provider services public read" on public.provider_services;
create policy "provider services public read" on public.provider_services for select using (exists(select 1 from public.providers p where p.id = provider_id and (p.published = true and p.status = 'approved' or p.user_id = auth.uid() or public.is_admin())));
drop policy if exists "published reviews public" on public.reviews;
create policy "published reviews public" on public.reviews for select using (published = true and exists(select 1 from public.providers p where p.id = provider_id and p.published = true and p.status = 'approved'));
drop policy if exists "providers read own reviews" on public.reviews;
create policy "providers read own reviews" on public.reviews for select using (exists(select 1 from public.providers p where p.id = provider_id and p.user_id = auth.uid()));
drop policy if exists "profile owner read" on public.profiles;
create policy "profile owner read" on public.profiles for select using (id = auth.uid() or public.is_admin());
drop policy if exists "profile owner update" on public.profiles;
create policy "profile owner update" on public.profiles for update using (id = auth.uid() or public.is_admin()) with check (id = auth.uid() or public.is_admin());
drop policy if exists "favorites owner" on public.favorites;
create policy "favorites owner" on public.favorites for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "admins manage categories" on public.categories;
create policy "admins manage categories" on public.categories for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admins manage providers" on public.providers;
create policy "admins manage providers" on public.providers for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "owners manage provider images" on public.provider_images;
create policy "owners manage provider images" on public.provider_images for all using (exists(select 1 from public.providers p where p.id=provider_id and (p.user_id=auth.uid() or public.is_admin()))) with check (exists(select 1 from public.providers p where p.id=provider_id and (p.user_id=auth.uid() or public.is_admin())));
drop policy if exists "owners manage provider services" on public.provider_services;
create policy "owners manage provider services" on public.provider_services for all using (exists(select 1 from public.providers p where p.id=provider_id and (p.user_id=auth.uid() or public.is_admin()))) with check (exists(select 1 from public.providers p where p.id=provider_id and (p.user_id=auth.uid() or public.is_admin())));
drop policy if exists "admins manage reviews" on public.reviews;
create policy "admins manage reviews" on public.reviews for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admins manage requests" on public.provider_requests;
create policy "admins manage requests" on public.provider_requests for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admins manage favorites" on public.favorites;
create policy "admins manage favorites" on public.favorites for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "providers read own contact events" on public.contact_events;
create policy "providers read own contact events" on public.contact_events for select using (exists(select 1 from public.providers p where p.id = provider_id and p.user_id = auth.uid()));
drop policy if exists "admins manage contact events" on public.contact_events;
create policy "admins manage contact events" on public.contact_events for all using (public.is_admin()) with check (public.is_admin());

-- provider_requests no tiene políticas públicas: las inserciones pasan por una ruta server-side con service role.
-- La service role omite RLS. Nunca debe exponerse en el navegador.

-- Storage: bucket público para imágenes de perfiles. Las escrituras requieren sesión y carpeta propia.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('provider-images', 'provider-images', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "provider images public read" on storage.objects;
create policy "provider images public read" on storage.objects for select using (bucket_id = 'provider-images');
drop policy if exists "providers upload own storage images" on storage.objects;
create policy "providers upload own storage images" on storage.objects for insert to authenticated with check (
  bucket_id = 'provider-images'
  and (storage.foldername(name))[1] = auth.uid()::text
  and exists (select 1 from public.providers p where p.id::text = (storage.foldername(name))[2] and p.user_id = auth.uid())
);
drop policy if exists "providers update own storage images" on storage.objects;
create policy "providers update own storage images" on storage.objects for update to authenticated using (
  bucket_id = 'provider-images' and (storage.foldername(name))[1] = auth.uid()::text
) with check (
  bucket_id = 'provider-images' and (storage.foldername(name))[1] = auth.uid()::text
);
drop policy if exists "providers delete own storage images" on storage.objects;
create policy "providers delete own storage images" on storage.objects for delete to authenticated using (
  bucket_id = 'provider-images' and (storage.foldername(name))[1] = auth.uid()::text
);
