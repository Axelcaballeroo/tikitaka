-- PROPOSED, NOT EXECUTED. Required before CUSTOMER_ACCOUNTS_ENABLED=true.
-- Review in staging together with the deployed output of 00_audit.sql.
begin;

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check
  check (role in ('admin', 'provider', 'customer'));

-- Public signup may request only provider/customer. Admin can never be self-assigned.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare requested_role text;
begin
  requested_role := case
    when new.raw_user_meta_data->>'account_type' in ('provider', 'customer')
      then new.raw_user_meta_data->>'account_type'
    else 'provider'
  end;
  insert into public.profiles(id, email, full_name, role)
  values(new.id, new.email, left(coalesce(new.raw_user_meta_data->>'full_name', ''), 120), requested_role)
  on conflict(id) do nothing;
  return new;
end $$;

-- Owners may edit basic data but can never change identity or role.
create or replace function public.guard_profile_privileges()
returns trigger language plpgsql security definer set search_path=pg_catalog,public as $$
begin
  if auth.role()='service_role'
    or (auth.uid() is null and session_user in ('postgres','supabase_admin'))
    or public.is_admin() then return new;
  end if;
  if tg_op='INSERT' then
    if new.id is distinct from auth.uid() or new.role not in ('provider','customer') then
      raise exception 'Profile privilege change forbidden' using errcode='42501';
    end if;
  elsif new.id is distinct from old.id or new.role is distinct from old.role then
    raise exception 'Profile privilege change forbidden' using errcode='42501';
  end if;
  return new;
end $$;

-- Favorites already belong to auth.uid(); these explicit policies document the customer flow.
drop policy if exists "favorites owner" on public.favorites;
create policy "favorites owner" on public.favorites for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

commit;
