-- NOT EXECUTED. Operator verifies the real business owner's identity/consent first.
-- Replace BOTH NULL values with independently verified UUIDs, review and approve.
-- Keeping user_id=NULL is supported for businesses managed only by Camila.
begin;
do $$
declare target_provider uuid := NULL; target_user uuid := NULL; existing_owner uuid;
begin
  if target_provider is null or target_user is null then raise exception 'Supply reviewed provider and user UUIDs'; end if;
  perform 1 from auth.users where id=target_user and email_confirmed_at is not null for update;
  if not found then raise exception 'Confirmed Auth user required'; end if;
  perform 1 from public.profiles where id=target_user and role='provider' for update;
  if not found then raise exception 'Provider role required; do not link an admin'; end if;
  select user_id into existing_owner from public.providers where id=target_provider for update;
  if not found then raise exception 'Provider not found'; end if;
  if existing_owner is not null and existing_owner<>target_user then raise exception 'Existing owner cannot be overwritten'; end if;
  if exists(select 1 from public.providers where user_id=target_user and id<>target_provider) then raise exception 'User already owns another provider; review manually without deleting records'; end if;
  update public.providers set user_id=target_user where id=target_provider and (user_id is null or user_id=target_user);
end $$;
commit;
