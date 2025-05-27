grant delete on table "auth"."audit_log_entries" to "prisma";

grant select on table "auth"."audit_log_entries" to "prisma";

grant delete on table "auth"."flow_state" to "prisma";

grant select on table "auth"."flow_state" to "prisma";

grant delete on table "auth"."identities" to "prisma";

grant select on table "auth"."identities" to "prisma";

grant delete on table "auth"."instances" to "prisma";

grant select on table "auth"."instances" to "prisma";

grant delete on table "auth"."mfa_amr_claims" to "prisma";

grant select on table "auth"."mfa_amr_claims" to "prisma";

grant delete on table "auth"."mfa_challenges" to "prisma";

grant select on table "auth"."mfa_challenges" to "prisma";

grant delete on table "auth"."mfa_factors" to "prisma";

grant select on table "auth"."mfa_factors" to "prisma";

grant delete on table "auth"."one_time_tokens" to "prisma";

grant select on table "auth"."one_time_tokens" to "prisma";

grant delete on table "auth"."refresh_tokens" to "prisma";

grant select on table "auth"."refresh_tokens" to "prisma";

grant delete on table "auth"."saml_providers" to "prisma";

grant select on table "auth"."saml_providers" to "prisma";

grant delete on table "auth"."saml_relay_states" to "prisma";

grant select on table "auth"."saml_relay_states" to "prisma";

grant delete on table "auth"."schema_migrations" to "prisma";

grant select on table "auth"."schema_migrations" to "prisma";

grant delete on table "auth"."sessions" to "prisma";

grant select on table "auth"."sessions" to "prisma";

grant delete on table "auth"."sso_domains" to "prisma";

grant select on table "auth"."sso_domains" to "prisma";

grant delete on table "auth"."sso_providers" to "prisma";

grant select on table "auth"."sso_providers" to "prisma";

grant delete on table "auth"."users" to "prisma";

grant select on table "auth"."users" to "prisma";

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();

CREATE TRIGGER on_auth_user_deleted BEFORE DELETE ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_user_delete();

CREATE TRIGGER on_auth_user_updated AFTER UPDATE ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_user_update();

drop trigger if exists "objects_delete_delete_prefix" on "storage"."objects";

drop trigger if exists "objects_insert_create_prefix" on "storage"."objects";

drop trigger if exists "objects_update_create_prefix" on "storage"."objects";

DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_catalog.pg_tables 
             WHERE schemaname = 'storage' 
             AND tablename = 'prefixes') THEN
    
    EXECUTE 'drop trigger if exists "prefixes_create_hierarchy" on "storage"."prefixes"';
    EXECUTE 'drop trigger if exists "prefixes_delete_hierarchy" on "storage"."prefixes"';
    
    EXECUTE 'revoke delete on table "storage"."prefixes" from "anon"';
    EXECUTE 'revoke insert on table "storage"."prefixes" from "anon"';
    EXECUTE 'revoke references on table "storage"."prefixes" from "anon"';
    EXECUTE 'revoke select on table "storage"."prefixes" from "anon"';
    EXECUTE 'revoke trigger on table "storage"."prefixes" from "anon"';
    EXECUTE 'revoke truncate on table "storage"."prefixes" from "anon"';
    EXECUTE 'revoke update on table "storage"."prefixes" from "anon"';
    
    EXECUTE 'revoke delete on table "storage"."prefixes" from "authenticated"';
    EXECUTE 'revoke insert on table "storage"."prefixes" from "authenticated"';
    EXECUTE 'revoke references on table "storage"."prefixes" from "authenticated"';
    EXECUTE 'revoke select on table "storage"."prefixes" from "authenticated"';
    EXECUTE 'revoke trigger on table "storage"."prefixes" from "authenticated"';
    EXECUTE 'revoke truncate on table "storage"."prefixes" from "authenticated"';
    EXECUTE 'revoke update on table "storage"."prefixes" from "authenticated"';
    
    EXECUTE 'revoke delete on table "storage"."prefixes" from "service_role"';
    EXECUTE 'revoke insert on table "storage"."prefixes" from "service_role"';
    EXECUTE 'revoke references on table "storage"."prefixes" from "service_role"';
    EXECUTE 'revoke select on table "storage"."prefixes" from "service_role"';
    EXECUTE 'revoke trigger on table "storage"."prefixes" from "service_role"';
    EXECUTE 'revoke truncate on table "storage"."prefixes" from "service_role"';
    EXECUTE 'revoke update on table "storage"."prefixes" from "service_role"';
    
    EXECUTE 'alter table "storage"."prefixes" drop constraint if exists "prefixes_bucketId_fkey"';
    EXECUTE 'alter table "storage"."prefixes" drop constraint if exists "prefixes_pkey"';
    
    EXECUTE 'drop table "storage"."prefixes"';
  END IF;
END $$;

drop function if exists "storage"."add_prefixes"(_bucket_id text, _name text);

drop function if exists "storage"."delete_prefix"(_bucket_id text, _name text);

drop function if exists "storage"."delete_prefix_hierarchy_trigger"();

drop function if exists "storage"."get_level"(name text);

drop function if exists "storage"."get_prefix"(name text);

drop function if exists "storage"."get_prefixes"(name text);

drop function if exists "storage"."objects_insert_prefix_trigger"();

drop function if exists "storage"."objects_update_prefix_trigger"();

drop function if exists "storage"."prefixes_insert_trigger"();

drop function if exists "storage"."search_legacy_v1"(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text);

drop function if exists "storage"."search_v1_optimised"(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text);

drop function if exists "storage"."search_v2"(prefix text, bucket_name text, limits integer, levels integer, start_after text);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'storage' AND indexname = 'idx_name_bucket_level_unique') THEN
    EXECUTE 'drop index "storage"."idx_name_bucket_level_unique"';
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'storage' AND indexname = 'idx_objects_lower_name') THEN
    EXECUTE 'drop index "storage"."idx_objects_lower_name"';
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'storage' AND indexname = 'idx_prefixes_lower_name') THEN
    EXECUTE 'drop index "storage"."idx_prefixes_lower_name"';
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'storage' AND indexname = 'objects_bucket_id_level_idx') THEN
    EXECUTE 'drop index "storage"."objects_bucket_id_level_idx"';
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'storage' AND indexname = 'prefixes_pkey') THEN
    EXECUTE 'drop index "storage"."prefixes_pkey"';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'storage'
    AND table_name = 'objects'
    AND column_name = 'level'
  ) THEN
    EXECUTE 'alter table "storage"."objects" drop column "level"';
  END IF;
END $$;

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION storage.extension(name text)
 RETURNS text
 LANGUAGE plpgsql
AS $function$
DECLARE
_parts text[];
_filename text;
BEGIN
	select string_to_array(name, '/') into _parts;
	select _parts[array_length(_parts,1)] into _filename;
	-- @todo return the last part instead of 2
	return reverse(split_part(reverse(_filename), '.', 1));
END
$function$
;

CREATE OR REPLACE FUNCTION storage.foldername(name text)
 RETURNS text[]
 LANGUAGE plpgsql
AS $function$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[1:array_length(_parts,1)-1];
END
$function$
;

CREATE OR REPLACE FUNCTION storage.get_size_by_bucket()
 RETURNS TABLE(size bigint, bucket_id text)
 LANGUAGE plpgsql
AS $function$
BEGIN
    return query
        select sum((metadata->>'size')::int) as size, obj.bucket_id
        from "storage".objects as obj
        group by obj.bucket_id;
END
$function$
;

CREATE OR REPLACE FUNCTION storage.search(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text)
 RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
 LANGUAGE plpgsql
 STABLE
AS $function$
declare
  v_order_by text;
  v_sort_order text;
begin
  case
    when sortcolumn = 'name' then
      v_order_by = 'name';
    when sortcolumn = 'updated_at' then
      v_order_by = 'updated_at';
    when sortcolumn = 'created_at' then
      v_order_by = 'created_at';
    when sortcolumn = 'last_accessed_at' then
      v_order_by = 'last_accessed_at';
    else
      v_order_by = 'name';
  end case;

  case
    when sortorder = 'asc' then
      v_sort_order = 'asc';
    when sortorder = 'desc' then
      v_sort_order = 'desc';
    else
      v_sort_order = 'asc';
  end case;

  v_order_by = v_order_by || ' ' || v_sort_order;

  return query execute
    'with folders as (
       select path_tokens[$1] as folder
       from storage.objects
         where objects.name ilike $2 || $3 || ''%''
           and bucket_id = $4
           and array_length(objects.path_tokens, 1) <> $1
       group by folder
       order by folder ' || v_sort_order || '
     )
     (select folder as "name",
            null as id,
            null as updated_at,
            null as created_at,
            null as last_accessed_at,
            null as metadata from folders)
     union all
     (select path_tokens[$1] as "name",
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
     from storage.objects
     where objects.name ilike $2 || $3 || ''%''
       and bucket_id = $4
       and array_length(objects.path_tokens, 1) = $1
     order by ' || v_order_by || ')
     limit $5
     offset $6' using levels, prefix, search, bucketname, limits, offsets;
end;
$function$
;

create policy "Anyone can update their own avatar."
on "storage"."objects"
as permissive
for update
to public
using ((( SELECT auth.uid() AS uid) = owner))
with check ((bucket_id = 'avatars'::text));


create policy "allow all 1oj01fe_0"
on "storage"."objects"
as permissive
for delete
to authenticated
using ((bucket_id = 'avatars'::text));


create policy "allow all 1oj01fe_1"
on "storage"."objects"
as permissive
for update
to authenticated
using ((bucket_id = 'avatars'::text));


create policy "allow all 1oj01fe_2"
on "storage"."objects"
as permissive
for insert
to authenticated
with check ((bucket_id = 'avatars'::text));


create policy "allow all 1oj01fe_3"
on "storage"."objects"
as permissive
for select
to authenticated
using ((bucket_id = 'avatars'::text));



-- drop type "gis"."geometry_dump";

-- drop type "gis"."valid_detail";

-- create type "gis"."geometry_dump" as ("path" integer[], "geom" geometry);

-- create type "gis"."valid_detail" as ("valid" boolean, "reason" character varying, "location" geometry);


