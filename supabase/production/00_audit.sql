-- READ ONLY. Prepared for an operator; not executed by this task.
select schemaname,tablename,policyname,roles,cmd,qual,with_check from pg_policies where schemaname in ('public','storage') order by schemaname,tablename,policyname;
select n.nspname,c.relname,c.relrowsecurity,c.relforcerowsecurity from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind='r';
select table_schema,table_name,grantee,privilege_type from information_schema.role_table_grants where table_schema in ('public','storage') and grantee in ('anon','authenticated','service_role') order by table_schema,table_name,grantee;
select conrelid::regclass as table_name,conname,pg_get_constraintdef(oid) as definition from pg_constraint where connamespace='public'::regnamespace order by conrelid::regclass::text,conname;
select event_object_table,trigger_name,action_statement from information_schema.triggers where trigger_schema='public';
select p.id,p.slug,p.user_id,case when p.user_id is null then 'B_without_owner' when u.id is not null and pr.role='provider' then 'A_valid_owner' else 'C_invalid_owner' end as ownership from public.providers p left join auth.users u on u.id=p.user_id left join public.profiles pr on pr.id=p.user_id order by p.slug;
select id,name,public,file_size_limit,allowed_mime_types from storage.buckets where id='provider-images';
