-- RECOMMENDED, NOT EXECUTED. Review deployed policies in 00_audit.sql first.
-- Non-destructive/idempotent; no user/provider is created, assigned or deleted.
-- Run only after approval, first against staging with real role tests.
begin;

create or replace function public.guard_profile_privileges()
returns trigger language plpgsql security definer set search_path=pg_catalog,public as $$
begin
  if auth.role()='service_role' or (auth.uid() is null and session_user in ('postgres','supabase_admin')) or public.is_admin() then return new; end if;
  if tg_op='INSERT' then
    if new.id is distinct from auth.uid() or new.role <> 'provider' then raise exception 'Profile privilege change forbidden' using errcode='42501'; end if;
  elsif new.id is distinct from old.id or new.role is distinct from old.role then
    raise exception 'Profile privilege change forbidden' using errcode='42501';
  end if;
  return new;
end $$;
drop trigger if exists guard_profile_privileges on public.profiles;
create trigger guard_profile_privileges before insert or update on public.profiles for each row execute function public.guard_profile_privileges();

create or replace function public.guard_provider_privileges()
returns trigger language plpgsql security definer set search_path=pg_catalog,public as $$
begin
  if auth.role()='service_role' or (auth.uid() is null and session_user in ('postgres','supabase_admin')) or public.is_admin() then return new; end if;
  if auth.uid() is null or new.user_id is distinct from auth.uid() then raise exception 'Provider ownership required' using errcode='42501'; end if;
  if tg_op='INSERT' then
    if new.status<>'pending' or new.published or new.verified or new.featured or new.rating<>0 or new.reviews_count<>0 then raise exception 'Moderation is admin only' using errcode='42501'; end if;
  else
    if old.user_id is distinct from auth.uid() or new.id is distinct from old.id or new.user_id is distinct from old.user_id
       or new.published is distinct from old.published or new.verified is distinct from old.verified or new.featured is distinct from old.featured
       or new.rating is distinct from old.rating or new.reviews_count is distinct from old.reviews_count
       or (new.status is distinct from old.status and not(old.status='rejected' and new.status='pending' and not old.published)) then
      raise exception 'Moderation is admin only' using errcode='42501';
    end if;
  end if;
  return new;
end $$;
drop trigger if exists guard_provider_privileges on public.providers;
create trigger guard_provider_privileges before insert or update on public.providers for each row execute function public.guard_provider_privileges();

-- Public creation of reviews/contact events uses the validated server endpoints.
revoke insert,update,delete on public.contact_events from anon,authenticated;
grant select on public.contact_events to authenticated;
grant all on public.contact_events to service_role;
revoke insert on public.reviews from anon,authenticated;
revoke update,delete on public.reviews from anon;
revoke insert,update,delete on public.providers,public.profiles,public.provider_images,public.provider_services,public.categories,public.provider_requests from anon;

drop policy if exists "published reviews public" on public.reviews;
create policy "published reviews public" on public.reviews for select using (
  published=true and status='approved' and exists(select 1 from public.providers p where p.id=provider_id and p.published=true and p.status='approved')
);

-- Second folder is the provider ID; transfer of ownership must revoke the old owner's access.
drop policy if exists "providers update own storage images" on storage.objects;
create policy "providers update own storage images" on storage.objects for update to authenticated using (
  bucket_id='provider-images' and exists(select 1 from public.providers p where p.id::text=(storage.foldername(name))[2] and p.user_id=auth.uid())
) with check (
  bucket_id='provider-images' and exists(select 1 from public.providers p where p.id::text=(storage.foldername(name))[2] and p.user_id=auth.uid())
);
drop policy if exists "providers delete own storage images" on storage.objects;
create policy "providers delete own storage images" on storage.objects for delete to authenticated using (
  bucket_id='provider-images' and exists(select 1 from public.providers p where p.id::text=(storage.foldername(name))[2] and p.user_id=auth.uid())
);
commit;
