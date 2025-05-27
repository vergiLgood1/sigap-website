-- Migration to recreate the prisma user with proper privileges
-- First, drop the existing prisma role if it exists and recreate it

-- Drop the role if it exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'prisma') THEN
    DROP ROLE prisma;
  END IF;
END
$$;

-- Create the prisma role with login capability
CREATE ROLE prisma WITH LOGIN PASSWORD 'prisma';

-- -- Grant usage on all necessary schemas
-- GRANT USAGE ON SCHEMA public TO prisma;
-- GRANT USAGE ON SCHEMA gis TO prisma;
-- GRANT USAGE ON SCHEMA auth TO prisma;
-- GRANT USAGE ON SCHEMA storage TO prisma;
-- GRANT USAGE ON SCHEMA graphql TO prisma;
-- GRANT USAGE ON SCHEMA extensions TO prisma;

-- -- Explicitly grant permissions on auth and storage schemas
-- DO $$
-- BEGIN
--   -- Explicitly grant on auth schema
--   EXECUTE 'GRANT USAGE ON SCHEMA auth TO prisma';
--   -- Explicitly grant on storage schema
--   EXECUTE 'GRANT USAGE ON SCHEMA storage TO prisma';
-- END
-- $$;

-- -- Grant privileges on all tables in schemas
-- DO $$
-- DECLARE
--   r RECORD;
-- BEGIN
--   -- Grant privileges on all tables in public schema
--   FOR r IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
--     EXECUTE 'GRANT ALL PRIVILEGES ON TABLE public.' || quote_ident(r.tablename) || ' TO prisma';
--   END LOOP;
  
--   -- Grant privileges on all tables in gis schema
--   FOR r IN SELECT tablename FROM pg_tables WHERE schemaname = 'gis' LOOP
--     EXECUTE 'GRANT ALL PRIVILEGES ON TABLE gis.' || quote_ident(r.tablename) || ' TO prisma';
--   END LOOP;
  
--   -- Grant privileges on all tables in auth schema
--   FOR r IN SELECT tablename FROM pg_tables WHERE schemaname = 'auth' LOOP
--     EXECUTE 'GRANT SELECT, DELETE ON TABLE auth.' || quote_ident(r.tablename) || ' TO prisma';
--   END LOOP;
  
--   -- Grant privileges on all tables in storage schema
--   FOR r IN SELECT tablename FROM pg_tables WHERE schemaname = 'storage' LOOP
--     EXECUTE 'GRANT SELECT, DELETE ON TABLE storage.' || quote_ident(r.tablename) || ' TO prisma';
--   END LOOP;
  
--   -- Grant privileges on all sequences in public schema
--   FOR r IN SELECT sequence_name FROM information_schema.sequences WHERE sequence_schema = 'public' LOOP
--     EXECUTE 'GRANT ALL PRIVILEGES ON SEQUENCE public.' || quote_ident(r.sequence_name) || ' TO prisma';
--   END LOOP;
  
--   -- Grant privileges on all sequences in gis schema
--   FOR r IN SELECT sequence_name FROM information_schema.sequences WHERE sequence_schema = 'gis' LOOP
--     EXECUTE 'GRANT ALL PRIVILEGES ON SEQUENCE gis.' || quote_ident(r.sequence_name) || ' TO prisma';
--   END LOOP;
  
--   -- Grant privileges on all sequences in auth schema
--   FOR r IN SELECT sequence_name FROM information_schema.sequences WHERE sequence_schema = 'auth' LOOP
--     EXECUTE 'GRANT USAGE ON SEQUENCE auth.' || quote_ident(r.sequence_name) || ' TO prisma';
--   END LOOP;
  
--   -- Grant privileges on all sequences in storage schema
--   FOR r IN SELECT sequence_name FROM information_schema.sequences WHERE sequence_schema = 'storage' LOOP
--     EXECUTE 'GRANT USAGE ON SEQUENCE storage.' || quote_ident(r.sequence_name) || ' TO prisma';
--   END LOOP;
  
--   -- Grant usage on all types in public schema
--   EXECUTE 'GRANT USAGE ON TYPE "public"."crime_rates" TO prisma';
--   EXECUTE 'GRANT USAGE ON TYPE "public"."crime_status" TO prisma';
--   EXECUTE 'GRANT USAGE ON TYPE "public"."session_status" TO prisma';
--   EXECUTE 'GRANT USAGE ON TYPE "public"."status_contact_messages" TO prisma';
--   EXECUTE 'GRANT USAGE ON TYPE "public"."unit_type" TO prisma';
-- END
-- $$;

-- -- Grant execute privileges on functions (separate DO block to avoid EXCEPTION issues)
-- DO $$
-- DECLARE
--   r RECORD;
-- BEGIN
--   -- Grant execute privileges on all functions in public schema
--   FOR r IN SELECT routines.routine_name 
--       FROM information_schema.routines 
--       WHERE routines.specific_schema = 'public' 
--       AND routines.routine_type = 'FUNCTION' LOOP
--     BEGIN
--       EXECUTE 'GRANT EXECUTE ON FUNCTION public.' || quote_ident(r.routine_name) || '() TO prisma';
--     EXCEPTION WHEN OTHERS THEN
--       RAISE NOTICE 'Error granting execute on function public.%: %', r.routine_name, SQLERRM;
--     END;
--   END LOOP;
-- END
-- $$;

-- -- Handle gis functions in a separate block
-- DO $$
-- DECLARE
--   r RECORD;
-- BEGIN
--   -- Grant execute privileges on all functions in gis schema
--   FOR r IN SELECT routines.routine_name 
--       FROM information_schema.routines 
--       WHERE routines.specific_schema = 'gis' 
--       AND routines.routine_type = 'FUNCTION' LOOP
--     BEGIN
--       EXECUTE 'GRANT EXECUTE ON FUNCTION gis.' || quote_ident(r.routine_name) || '() TO prisma';
--     EXCEPTION WHEN OTHERS THEN
--       RAISE NOTICE 'Error granting execute on function gis.%: %', r.routine_name, SQLERRM;
--     END;
--   END LOOP;
-- END
-- $$;

-- -- Set default privileges for future objects
-- ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO prisma;
-- ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO prisma;
-- ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO prisma;
-- ALTER DEFAULT PRIVILEGES IN SCHEMA gis GRANT ALL ON TABLES TO prisma;
-- ALTER DEFAULT PRIVILEGES IN SCHEMA gis GRANT ALL ON SEQUENCES TO prisma;
-- ALTER DEFAULT PRIVILEGES IN SCHEMA gis GRANT ALL ON FUNCTIONS TO prisma;
-- ALTER DEFAULT PRIVILEGES IN SCHEMA auth GRANT SELECT, DELETE ON TABLES TO prisma;
-- ALTER DEFAULT PRIVILEGES IN SCHEMA storage GRANT SELECT, DELETE ON TABLES TO prisma;

-- -- Ensure the prisma role has the necessary permissions for the auth schema triggers
-- DO $$
-- BEGIN
--   EXECUTE 'GRANT EXECUTE ON FUNCTION public.handle_new_user() TO prisma';
-- EXCEPTION WHEN OTHERS THEN
--   RAISE NOTICE 'Error granting execute on function public.handle_new_user(): %', SQLERRM;
-- END $$;

-- DO $$
-- BEGIN
--   EXECUTE 'GRANT EXECUTE ON FUNCTION public.handle_user_delete() TO prisma';
-- EXCEPTION WHEN OTHERS THEN
--   RAISE NOTICE 'Error granting execute on function public.handle_user_delete(): %', SQLERRM;
-- END $$;

-- DO $$
-- BEGIN
--   EXECUTE 'GRANT EXECUTE ON FUNCTION public.handle_user_update() TO prisma';
-- EXCEPTION WHEN OTHERS THEN
--   RAISE NOTICE 'Error granting execute on function public.handle_user_update(): %', SQLERRM;
-- END $$;

-- -- Grant postgres user the ability to manage prisma role
-- GRANT prisma TO postgres;
