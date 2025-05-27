

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "gis";

CREATE ROLE prisma;

ALTER SCHEMA "gis" OWNER TO "postgres";


CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgsodium";








ALTER SCHEMA "public" OWNER TO "postgres";


CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "postgis" WITH SCHEMA "gis";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."crime_rates" AS ENUM (
    'low',
    'medium',
    'high',
    'critical'
);


ALTER TYPE "public"."crime_rates" OWNER TO "postgres";


CREATE TYPE "public"."crime_status" AS ENUM (
    'open',
    'closed',
    'under_investigation',
    'resolved',
    'unresolved'
);


ALTER TYPE "public"."crime_status" OWNER TO "postgres";


CREATE TYPE "public"."session_status" AS ENUM (
    'active',
    'completed'
);


ALTER TYPE "public"."session_status" OWNER TO "postgres";


CREATE TYPE "public"."status_contact_messages" AS ENUM (
    'new',
    'read',
    'replied',
    'closed'
);


ALTER TYPE "public"."status_contact_messages" OWNER TO "postgres";


CREATE TYPE "public"."unit_type" AS ENUM (
    'polda',
    'polsek',
    'polres',
    'other'
);


ALTER TYPE "public"."unit_type" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "gis"."backfill_resources_and_permissions"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    table_record record;
BEGIN
    -- For each existing table in the public schema
    FOR table_record IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
    LOOP
        -- Call the function to create resource and permissions for each table
        PERFORM gis.create_resource_and_permissions_for_table(table_record.table_name);
    END LOOP;
END;
$$;


ALTER FUNCTION "gis"."backfill_resources_and_permissions"() OWNER TO "postgres";


COMMENT ON FUNCTION "gis"."backfill_resources_and_permissions"() IS 'Function to backfill resources and permissions for existing tables';



CREATE OR REPLACE FUNCTION "gis"."calculate_distance_to_district_unit"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Calculate the distance to the unit assigned to this district
  SELECT ST_Distance(
      NEW.location::geography,
      u.location::geography
    )::gis.geography / 1000 -- Convert to kilometers
  INTO NEW.distance_to_unit
  FROM units u
  WHERE u.district_id = NEW.district_id;

  -- If no unit found for this district, set distance_to_unit to NULL
  -- This indicates that the district doesn't have an assigned unit
  IF NEW.distance_to_unit IS NULL THEN
    RAISE NOTICE 'No assigned unit found for district id %', NEW.district_id;
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "gis"."calculate_distance_to_district_unit"() OWNER TO "postgres";


COMMENT ON FUNCTION "gis"."calculate_distance_to_district_unit"() IS 'Calculates the distance from a location to its district''s assigned police unit and populates the distance_to_unit field';



CREATE OR REPLACE FUNCTION "gis"."calculate_unit_incident_distances"("p_unit_id" character varying, "p_district_id" character varying DEFAULT NULL::character varying) RETURNS TABLE("unit_code" character varying, "incident_id" character varying, "district_name" character varying, "distance_meters" double precision)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  RETURN QUERY
  WITH unit_locations AS (
    SELECT
      u.code_unit,
      u.district_id,
      ST_SetSRID(ST_MakePoint(u.longitude, u.latitude), 4326)::gis.geography AS location
    FROM
      units u
    WHERE
      (p_unit_id IS NULL OR u.code_unit = p_unit_id)
      AND (p_district_id IS NULL OR u.district_id = p_district_id)
      AND u.latitude IS NOT NULL
      AND u.longitude IS NOT NULL
  ),
  incident_locations AS (
    SELECT
      ci.id,
      ci.crime_id,
      ci.crime_category_id,
      ST_SetSRID(ST_MakePoint(l.longitude, l.latitude), 4326)::gis.geography AS location
    FROM
      crime_incidents ci
    JOIN
      locations l ON ci.location_id = l.id
    WHERE
      l.latitude IS NOT NULL
      AND l.longitude IS NOT NULL
  )
  SELECT
    ul.code_unit as unit_code,
    il.id as incident_id,
    d.name as district_name,
    ST_Distance(ul.location, il.location) as distance_meters
  FROM
    unit_locations ul
  JOIN
    districts d ON ul.district_id = d.id
  JOIN
    crimes c ON c.district_id = d.id
  JOIN
    incident_locations il ON il.crime_id = c.id
  ORDER BY
    ul.code_unit,
    ul.location <-> il.location;
END;
$$;


ALTER FUNCTION "gis"."calculate_unit_incident_distances"("p_unit_id" character varying, "p_district_id" character varying) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "gis"."create_resource_and_permissions_for_table"("table_name" "text") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    resource_id uuid;
    admin_role_id uuid;
BEGIN
    -- Get the admin role ID
    SELECT id INTO admin_role_id FROM roles WHERE name = 'admin';
    
    -- If admin role doesn't exist, log a notice and exit
    IF admin_role_id IS NULL THEN
        RAISE NOTICE 'Admin role not found. No permissions created.';
        RETURN;
    END IF;
    
    -- Skip system tables and migration tables
    IF table_name ~ '^(pg_|_|migrations)' THEN
        RETURN;
    END IF;
    
    -- Check if resource already exists for this table
    IF NOT EXISTS (SELECT 1 FROM resources WHERE name = table_name) THEN
        -- Create new resource entry
        INSERT INTO resources (
            id, 
            name, 
            type, 
            description, 
            instance_role, 
            relations, 
            attributes, 
            created_at, 
            updated_at
        ) VALUES (
            gen_random_uuid(), 
            table_name, 
            'table', 
            'Auto-generated resource for table ' || table_name, 
            NULL, 
            NULL, 
            '{"auto_generated": true}'::jsonb, 
            NOW(), 
            NOW()
        )
        RETURNING id INTO resource_id;
        
        RAISE NOTICE 'Created new resource for table %', table_name;
        
        -- Create CRUD permissions for admin role
        -- Create permission
        INSERT INTO permissions (id, action, resource_id, role_id, created_at, updated_at)
        VALUES (
            gen_random_uuid(), 
            'create', 
            resource_id, 
            admin_role_id, 
            NOW(), 
            NOW()
        );
        
        -- Read permission
        INSERT INTO permissions (id, action, resource_id, role_id, created_at, updated_at)
        VALUES (
            gen_random_uuid(), 
            'read', 
            resource_id, 
            admin_role_id, 
            NOW(), 
            NOW()
        );
        
        -- Update permission
        INSERT INTO permissions (id, action, resource_id, role_id, created_at, updated_at)
        VALUES (
            gen_random_uuid(), 
            'update', 
            resource_id, 
            admin_role_id, 
            NOW(), 
            NOW()
        );
        
        -- Delete permission
        INSERT INTO permissions (id, action, resource_id, role_id, created_at, updated_at)
        VALUES (
            gen_random_uuid(), 
            'delete', 
            resource_id, 
            admin_role_id, 
            NOW(), 
            NOW()
        );
        
        RAISE NOTICE 'Created CRUD permissions for admin role on resource %', table_name;
    END IF;
END;
$$;


ALTER FUNCTION "gis"."create_resource_and_permissions_for_table"("table_name" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "gis"."create_resource_and_permissions_for_table"("table_name" "text") IS 'Creates resource entry and admin CRUD permissions for the specified table';



CREATE OR REPLACE FUNCTION "gis"."find_nearest_unit"("p_incident_id" character varying) RETURNS TABLE("unit_code" character varying, "unit_name" character varying, "distance_meters" double precision)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  WITH incident_location AS (
    SELECT
      ci.id,
      l.location AS location
    FROM
      crime_incidents ci
    JOIN
      locations l ON ci.location_id = l.id
    WHERE
      ci.id = p_incident_id
  ),
  unit_locations AS (
    SELECT 
      u.code_unit,
      u.name,
      u.location
    FROM
      units u
  )
  SELECT
    ul.code_unit as unit_code,
    ul.name as unit_name,
    ST_Distance(ul.location, il.location) as distance_meters
  FROM
    unit_locations ul
  CROSS JOIN
    incident_location il
  ORDER BY
    ul.location <-> il.location
  LIMIT 1;
END;
$$;


ALTER FUNCTION "gis"."find_nearest_unit"("p_incident_id" character varying) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "gis"."find_nearest_unit_to_incident"("p_incident_id" integer) RETURNS TABLE("unit_code" "text", "unit_name" "text", "distance_meters" double precision)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  WITH incident_location AS (
    SELECT
      ci.id,
      ST_SetSRID(ST_MakePoint(
        (ci.locations->>'longitude')::float, 
        (ci.locations->>'latitude')::float
      ), 4326)::geography AS location
    FROM
      crime_incidents ci
    WHERE
      ci.id = p_incident_id
      AND (ci.locations->>'latitude') IS NOT NULL
      AND (ci.locations->>'longitude') IS NOT NULL
  ),
  unit_locations AS (
    SELECT 
      u.code_unit,
      u.name,
      ST_SetSRID(ST_MakePoint(u.longitude, u.latitude), 4326)::geography AS location
    FROM
      units u
    WHERE
      u.latitude IS NOT NULL
      AND u.longitude IS NOT NULL
  )
  SELECT
    ul.code_unit as unit_code,
    ul.name as unit_name,
    ST_Distance(ul.location, il.location) as distance_meters
  FROM
    unit_locations ul
  CROSS JOIN
    incident_location il
  ORDER BY
    ul.location <-> il.location
  LIMIT 1;
END;
$$;


ALTER FUNCTION "gis"."find_nearest_unit_to_incident"("p_incident_id" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "gis"."find_units_within_distance"("p_incident_id" integer, "p_max_distance_meters" double precision DEFAULT 5000) RETURNS TABLE("unit_code" "text", "unit_name" "text", "distance_meters" double precision)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  WITH incident_location AS (
    SELECT
      ci.id,
      ST_SetSRID(ST_MakePoint(
        (ci.locations->>'longitude')::float, 
        (ci.locations->>'latitude')::float
      ), 4326)::geography AS location
    FROM
      crime_incidents ci
    WHERE
      ci.id = p_incident_id
      AND (ci.locations->>'latitude') IS NOT NULL
      AND (ci.locations->>'longitude') IS NOT NULL
  ),
  unit_locations AS (
    SELECT 
      u.code_unit,
      u.name,
      ST_SetSRID(ST_MakePoint(u.longitude, u.latitude), 4326)::geography AS location
    FROM
      units u
    WHERE
      u.latitude IS NOT NULL
      AND u.longitude IS NOT NULL
  )
  SELECT
    ul.code_unit as unit_code,
    ul.name as unit_name,
    ST_Distance(ul.location, il.location) as distance_meters
  FROM
    unit_locations ul
  CROSS JOIN
    incident_location il
  WHERE
    ST_DWithin(ul.location, il.location, p_max_distance_meters)
  ORDER BY
    ST_Distance(ul.location, il.location);
END;
$$;


ALTER FUNCTION "gis"."find_units_within_distance"("p_incident_id" integer, "p_max_distance_meters" double precision) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "gis"."find_units_within_distance"("p_incident_id" character varying, "p_max_distance_meters" double precision DEFAULT 5000) RETURNS TABLE("unit_code" character varying, "unit_name" character varying, "distance_meters" double precision)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  WITH incident_location AS (
    SELECT
      ci.id,
      l.location AS location
    FROM
      crime_incidents ci
    JOIN
      locations l ON ci.location_id = l.id
    WHERE
      ci.id = p_incident_id
  ),
  unit_locations AS (
    SELECT 
      u.code_unit,
      u.name,
      u.location
    FROM
      units u
  )
  SELECT
    ul.code_unit as unit_code,
    ul.name as unit_name,
    ST_Distance(ul.location, il.location) as distance_meters
  FROM
    unit_locations ul
  CROSS JOIN
    incident_location il
  WHERE
    ST_DWithin(ul.location, il.location, p_max_distance_meters)
  ORDER BY
    ST_Distance(ul.location, il.location);
END;
$$;


ALTER FUNCTION "gis"."find_units_within_distance"("p_incident_id" character varying, "p_max_distance_meters" double precision) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "gis"."update_land_area"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.land_area := ROUND((ST_Area(NEW.geometry::geography) / 1000000.0)::numeric, 2);
  RETURN NEW;
END;
$$;


ALTER FUNCTION "gis"."update_land_area"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."_prisma_migrations" (
    "id" character varying(36) NOT NULL,
    "checksum" character varying(64) NOT NULL,
    "finished_at" timestamp with time zone,
    "migration_name" character varying(255) NOT NULL,
    "logs" "text",
    "rolled_back_at" timestamp with time zone,
    "started_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "applied_steps_count" integer DEFAULT 0 NOT NULL
);


ALTER TABLE "public"."_prisma_migrations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."cities" (
    "id" character varying(20) NOT NULL,
    "name" character varying(100) NOT NULL,
    "created_at" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."cities" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."contact_messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying(255),
    "email" character varying(255),
    "phone" character varying(20),
    "message_type" character varying(50),
    "message_type_label" character varying(50),
    "message" "text",
    "status" "public"."status_contact_messages" DEFAULT 'new'::"public"."status_contact_messages" NOT NULL,
    "created_at" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp(6) with time zone NOT NULL
);


ALTER TABLE "public"."contact_messages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."crime_categories" (
    "id" character varying(20) NOT NULL,
    "name" character varying(255) NOT NULL,
    "description" "text" NOT NULL,
    "created_at" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP,
    "type" character varying(100)
);


ALTER TABLE "public"."crime_categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."crime_incidents" (
    "id" character varying(20) NOT NULL,
    "crime_id" character varying(20) NOT NULL,
    "crime_category_id" character varying(20) NOT NULL,
    "location_id" "uuid" NOT NULL,
    "description" "text" NOT NULL,
    "victim_count" integer NOT NULL,
    "status" "public"."crime_status" DEFAULT 'open'::"public"."crime_status",
    "created_at" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP,
    "timestamp" timestamp(6) with time zone NOT NULL
);


ALTER TABLE "public"."crime_incidents" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."crimes" (
    "id" character varying(20) NOT NULL,
    "district_id" character varying(20) NOT NULL,
    "created_at" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP,
    "level" "public"."crime_rates" DEFAULT 'low'::"public"."crime_rates" NOT NULL,
    "method" character varying(100),
    "month" integer,
    "number_of_crime" integer DEFAULT 0 NOT NULL,
    "score" double precision DEFAULT 0 NOT NULL,
    "updated_at" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP,
    "year" integer,
    "source_type" character varying(100),
    "crime_cleared" integer DEFAULT 0 NOT NULL,
    "avg_crime" double precision DEFAULT 0 NOT NULL
);


ALTER TABLE "public"."crimes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."demographics" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "district_id" character varying(20) NOT NULL,
    "population" integer NOT NULL,
    "number_of_unemployed" integer NOT NULL,
    "population_density" double precision NOT NULL,
    "year" integer NOT NULL,
    "created_at" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."demographics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."districts" (
    "id" character varying(20) NOT NULL,
    "city_id" character varying(20) NOT NULL,
    "name" character varying(100) NOT NULL,
    "created_at" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."districts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying(255) NOT NULL,
    "description" character varying(255),
    "code" "text" NOT NULL,
    "created_at" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "user_id" "uuid" NOT NULL
);


ALTER TABLE "public"."events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."evidence" (
    "incident_id" "uuid" NOT NULL,
    "type" character varying(50) NOT NULL,
    "url" "text" NOT NULL,
    "uploaded_at" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP,
    "caption" character varying(255),
    "description" character varying(255),
    "metadata" "jsonb",
    "id" character varying(20) NOT NULL
);


ALTER TABLE "public"."evidence" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."geographics" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "district_id" character varying(20) NOT NULL,
    "address" "text",
    "longitude" double precision NOT NULL,
    "latitude" double precision NOT NULL,
    "land_area" double precision,
    "polygon" "gis"."geometry",
    "geometry" "gis"."geometry",
    "created_at" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP,
    "description" "text",
    "type" character varying(100),
    "location" "gis"."geography" NOT NULL,
    "year" integer
);


ALTER TABLE "public"."geographics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."incident_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "location_id" "uuid" NOT NULL,
    "category_id" character varying(20) NOT NULL,
    "description" "text",
    "source" "text" DEFAULT 'manual'::"text",
    "time" timestamp(6) with time zone NOT NULL,
    "verified" boolean DEFAULT false,
    "created_at" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."incident_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."location_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "latitude" double precision NOT NULL,
    "longitude" double precision NOT NULL,
    "location" "gis"."geography" NOT NULL,
    "timestamp" timestamp(6) with time zone NOT NULL,
    "description" character varying(255),
    "created_at" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE "public"."location_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."locations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "district_id" character varying(20) NOT NULL,
    "event_id" "uuid" NOT NULL,
    "address" character varying(255),
    "type" character varying(100),
    "latitude" double precision NOT NULL,
    "longitude" double precision NOT NULL,
    "land_area" double precision,
    "polygon" "gis"."geometry",
    "geometry" "gis"."geometry",
    "created_at" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP,
    "location" "gis"."geography" NOT NULL,
    "distance_to_unit" double precision
);


ALTER TABLE "public"."locations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "action" character varying(100) NOT NULL,
    "entity" character varying(100) NOT NULL,
    "entity_id" character varying(100),
    "changes" "jsonb",
    "user_id" character varying(100),
    "ip_address" character varying(100),
    "user_agent" character varying(255),
    "created_at" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE "public"."logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."officers" (
    "unit_id" character varying(20) NOT NULL,
    "role_id" "uuid" NOT NULL,
    "nrp" character varying(100) NOT NULL,
    "name" character varying(100) NOT NULL,
    "rank" character varying(100),
    "position" character varying(100),
    "phone" character varying(20),
    "email" character varying(255),
    "avatar" "text",
    "valid_until" timestamp(3) without time zone,
    "qr_code" "text",
    "created_at" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP,
    "patrol_unit_id" character varying(100) NOT NULL,
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "banned_reason" character varying(255),
    "banned_until" timestamp(3) without time zone,
    "is_banned" boolean DEFAULT false NOT NULL,
    "panic_strike" integer DEFAULT 0 NOT NULL,
    "spoofing_attempts" integer DEFAULT 0 NOT NULL
);


ALTER TABLE "public"."officers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."panic_button_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "officer_id" "uuid",
    "incident_id" "uuid" NOT NULL,
    "timestamp" timestamp(6) with time zone NOT NULL
);


ALTER TABLE "public"."panic_button_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."patrol_units" (
    "unit_id" character varying(20) NOT NULL,
    "location_id" "uuid" NOT NULL,
    "name" character varying(100) NOT NULL,
    "type" character varying(50) NOT NULL,
    "status" character varying(50) NOT NULL,
    "radius" double precision NOT NULL,
    "created_at" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "id" character varying(100) NOT NULL
);


ALTER TABLE "public"."patrol_units" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."permissions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "action" "text" NOT NULL,
    "resource_id" "uuid" NOT NULL,
    "role_id" "uuid" NOT NULL,
    "created_at" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp(6) with time zone NOT NULL
);


ALTER TABLE "public"."permissions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "avatar" character varying(355),
    "username" character varying(255),
    "first_name" character varying(255),
    "last_name" character varying(255),
    "bio" character varying,
    "address" "json",
    "birth_date" timestamp(3) without time zone,
    "nik" character varying(100) DEFAULT ''::character varying NOT NULL
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."resources" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying(255) NOT NULL,
    "type" "text",
    "description" "text",
    "instance_role" "text",
    "relations" "text",
    "attributes" "jsonb",
    "created_at" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE "public"."resources" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."roles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying(255) NOT NULL,
    "description" "text",
    "created_at" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE "public"."roles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sessions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "event_id" "uuid" NOT NULL,
    "status" "public"."session_status" DEFAULT 'active'::"public"."session_status" NOT NULL,
    "created_at" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE "public"."sessions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."unit_statistics" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "crime_total" integer NOT NULL,
    "crime_cleared" integer NOT NULL,
    "percentage" double precision,
    "pending" integer,
    "month" integer NOT NULL,
    "year" integer NOT NULL,
    "created_at" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP,
    "code_unit" character varying(20) NOT NULL
);


ALTER TABLE "public"."unit_statistics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."units" (
    "code_unit" character varying(20) NOT NULL,
    "district_id" character varying(20),
    "name" character varying(100) NOT NULL,
    "description" "text",
    "type" "public"."unit_type" NOT NULL,
    "created_at" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP,
    "address" "text",
    "land_area" double precision,
    "latitude" double precision NOT NULL,
    "longitude" double precision NOT NULL,
    "location" "gis"."geography" NOT NULL,
    "city_id" character varying(20) NOT NULL,
    "phone" character varying(20)
);


ALTER TABLE "public"."units" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "roles_id" "uuid" NOT NULL,
    "email" character varying(255) NOT NULL,
    "phone" character varying(20),
    "encrypted_password" character varying(255),
    "invited_at" timestamp(6) with time zone,
    "confirmed_at" timestamp(6) with time zone,
    "email_confirmed_at" timestamp(6) with time zone,
    "recovery_sent_at" timestamp(6) with time zone,
    "last_sign_in_at" timestamp(6) with time zone,
    "app_metadata" "jsonb",
    "user_metadata" "jsonb",
    "created_at" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "banned_until" timestamp(6) with time zone,
    "is_anonymous" boolean DEFAULT false NOT NULL,
    "banned_reason" character varying(255),
    "is_banned" boolean DEFAULT false NOT NULL,
    "panic_strike" integer DEFAULT 0 NOT NULL,
    "spoofing_attempts" integer DEFAULT 0 NOT NULL
);


ALTER TABLE "public"."users" OWNER TO "postgres";


ALTER TABLE ONLY "public"."_prisma_migrations"
    ADD CONSTRAINT "_prisma_migrations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."cities"
    ADD CONSTRAINT "cities_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."contact_messages"
    ADD CONSTRAINT "contact_messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."crime_categories"
    ADD CONSTRAINT "crime_categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."crime_incidents"
    ADD CONSTRAINT "crime_incidents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."crimes"
    ADD CONSTRAINT "crimes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."demographics"
    ADD CONSTRAINT "demographics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."districts"
    ADD CONSTRAINT "districts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."events"
    ADD CONSTRAINT "events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."evidence"
    ADD CONSTRAINT "evidence_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."geographics"
    ADD CONSTRAINT "geographics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."incident_logs"
    ADD CONSTRAINT "incident_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."location_logs"
    ADD CONSTRAINT "location_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."locations"
    ADD CONSTRAINT "locations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."logs"
    ADD CONSTRAINT "logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."officers"
    ADD CONSTRAINT "officers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."panic_button_logs"
    ADD CONSTRAINT "panic_button_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."patrol_units"
    ADD CONSTRAINT "patrol_units_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."permissions"
    ADD CONSTRAINT "permissions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."resources"
    ADD CONSTRAINT "resources_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."roles"
    ADD CONSTRAINT "roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sessions"
    ADD CONSTRAINT "sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."unit_statistics"
    ADD CONSTRAINT "unit_statistics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."units"
    ADD CONSTRAINT "units_pkey" PRIMARY KEY ("code_unit");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



CREATE UNIQUE INDEX "demographics_district_id_year_key" ON "public"."demographics" USING "btree" ("district_id", "year");



CREATE UNIQUE INDEX "events_code_key" ON "public"."events" USING "btree" ("code");



CREATE UNIQUE INDEX "evidence_id_key" ON "public"."evidence" USING "btree" ("id");



CREATE INDEX "idx_cities_name" ON "public"."cities" USING "btree" ("name");



CREATE INDEX "idx_crime_categories_name" ON "public"."crime_categories" USING "btree" ("name");



CREATE INDEX "idx_crime_incidents_crime_category_id" ON "public"."crime_incidents" USING "btree" ("crime_category_id");



CREATE INDEX "idx_crime_incidents_crime_id" ON "public"."crime_incidents" USING "btree" ("crime_id");



CREATE INDEX "idx_crime_incidents_date" ON "public"."crime_incidents" USING "btree" ("timestamp");



CREATE INDEX "idx_crime_incidents_location_id" ON "public"."crime_incidents" USING "btree" ("location_id");



CREATE INDEX "idx_crime_incidents_status" ON "public"."crime_incidents" USING "btree" ("status");



CREATE INDEX "idx_crimes_district_id_month" ON "public"."crimes" USING "btree" ("district_id", "month");



CREATE INDEX "idx_crimes_district_id_year_month" ON "public"."crimes" USING "btree" ("district_id", "year", "month");



CREATE INDEX "idx_crimes_month" ON "public"."crimes" USING "btree" ("month");



CREATE INDEX "idx_crimes_month_year" ON "public"."crimes" USING "btree" ("month", "year");



CREATE INDEX "idx_crimes_year" ON "public"."crimes" USING "btree" ("year");



CREATE INDEX "idx_demographics_year" ON "public"."demographics" USING "btree" ("year");



CREATE INDEX "idx_districts_city_id" ON "public"."districts" USING "btree" ("city_id");



CREATE INDEX "idx_districts_name" ON "public"."districts" USING "btree" ("name");



CREATE INDEX "idx_events_code" ON "public"."events" USING "btree" ("code");



CREATE INDEX "idx_events_id" ON "public"."events" USING "btree" ("id");



CREATE INDEX "idx_events_name" ON "public"."events" USING "btree" ("name");



CREATE INDEX "idx_evidence_incident_id" ON "public"."evidence" USING "btree" ("incident_id");



CREATE INDEX "idx_geographics_district_id" ON "public"."geographics" USING "btree" ("district_id");



CREATE INDEX "idx_geographics_district_id_year" ON "public"."geographics" USING "btree" ("district_id", "year");



CREATE INDEX "idx_geographics_location" ON "public"."geographics" USING "gist" ("location");



CREATE INDEX "idx_geographics_type" ON "public"."geographics" USING "btree" ("type");



CREATE INDEX "idx_incident_logs_category_id" ON "public"."incident_logs" USING "btree" ("category_id");



CREATE INDEX "idx_incident_logs_time" ON "public"."incident_logs" USING "btree" ("time");



CREATE INDEX "idx_location_logs_timestamp" ON "public"."location_logs" USING "btree" ("timestamp");



CREATE INDEX "idx_location_logs_user_id" ON "public"."location_logs" USING "btree" ("user_id");



CREATE INDEX "idx_locations_district_id" ON "public"."locations" USING "btree" ("district_id");



CREATE INDEX "idx_locations_geography" ON "public"."locations" USING "gist" ("location");



CREATE INDEX "idx_locations_type" ON "public"."locations" USING "btree" ("type");



CREATE INDEX "idx_officers_name" ON "public"."officers" USING "btree" ("name");



CREATE INDEX "idx_officers_nrp" ON "public"."officers" USING "btree" ("nrp");



CREATE INDEX "idx_officers_position" ON "public"."officers" USING "btree" ("position");



CREATE INDEX "idx_officers_rank" ON "public"."officers" USING "btree" ("rank");



CREATE INDEX "idx_officers_unit_id" ON "public"."officers" USING "btree" ("unit_id");



CREATE INDEX "idx_panic_buttons_user_id" ON "public"."panic_button_logs" USING "btree" ("user_id");



CREATE INDEX "idx_patrol_units_location_id" ON "public"."patrol_units" USING "btree" ("location_id");



CREATE INDEX "idx_patrol_units_name" ON "public"."patrol_units" USING "btree" ("name");



CREATE INDEX "idx_patrol_units_status" ON "public"."patrol_units" USING "btree" ("status");



CREATE INDEX "idx_patrol_units_type" ON "public"."patrol_units" USING "btree" ("type");



CREATE INDEX "idx_patrol_units_unit_id" ON "public"."patrol_units" USING "btree" ("unit_id");



CREATE INDEX "idx_profiles_nik" ON "public"."profiles" USING "btree" ("nik");



CREATE INDEX "idx_sessions_event_id" ON "public"."sessions" USING "btree" ("event_id");



CREATE INDEX "idx_sessions_status" ON "public"."sessions" USING "btree" ("status");



CREATE INDEX "idx_sessions_user_id" ON "public"."sessions" USING "btree" ("user_id");



CREATE INDEX "idx_unit_location" ON "public"."units" USING "gist" ("location");



CREATE INDEX "idx_unit_statistics_year_month" ON "public"."unit_statistics" USING "btree" ("year", "month");



CREATE INDEX "idx_units_code_unit" ON "public"."units" USING "btree" ("code_unit");



CREATE INDEX "idx_units_district_id" ON "public"."units" USING "btree" ("district_id");



CREATE INDEX "idx_units_location_district" ON "public"."units" USING "btree" ("district_id", "location");



CREATE INDEX "idx_units_name" ON "public"."units" USING "btree" ("name");



CREATE INDEX "idx_units_type" ON "public"."units" USING "btree" ("type");



CREATE INDEX "logs_entity_idx" ON "public"."logs" USING "btree" ("entity");



CREATE INDEX "logs_user_id_idx" ON "public"."logs" USING "btree" ("user_id");



CREATE UNIQUE INDEX "officers_nrp_key" ON "public"."officers" USING "btree" ("nrp");



CREATE UNIQUE INDEX "patrol_units_id_key" ON "public"."patrol_units" USING "btree" ("id");



CREATE UNIQUE INDEX "profiles_nik_key" ON "public"."profiles" USING "btree" ("nik");



CREATE INDEX "profiles_user_id_idx" ON "public"."profiles" USING "btree" ("user_id");



CREATE UNIQUE INDEX "profiles_user_id_key" ON "public"."profiles" USING "btree" ("user_id");



CREATE INDEX "profiles_username_idx" ON "public"."profiles" USING "btree" ("username");



CREATE UNIQUE INDEX "profiles_username_key" ON "public"."profiles" USING "btree" ("username");



CREATE UNIQUE INDEX "resources_name_key" ON "public"."resources" USING "btree" ("name");



CREATE UNIQUE INDEX "roles_name_key" ON "public"."roles" USING "btree" ("name");



CREATE UNIQUE INDEX "unit_statistics_code_unit_month_year_key" ON "public"."unit_statistics" USING "btree" ("code_unit", "month", "year");



CREATE UNIQUE INDEX "units_code_unit_key" ON "public"."units" USING "btree" ("code_unit");



CREATE UNIQUE INDEX "units_district_id_key" ON "public"."units" USING "btree" ("district_id");



CREATE INDEX "users_created_at_idx" ON "public"."users" USING "btree" ("created_at");



CREATE UNIQUE INDEX "users_email_key" ON "public"."users" USING "btree" ("email");



CREATE INDEX "users_is_anonymous_idx" ON "public"."users" USING "btree" ("is_anonymous");



CREATE UNIQUE INDEX "users_phone_key" ON "public"."users" USING "btree" ("phone");



CREATE INDEX "users_updated_at_idx" ON "public"."users" USING "btree" ("updated_at");



ALTER TABLE ONLY "public"."crime_incidents"
    ADD CONSTRAINT "crime_incidents_crime_category_id_fkey" FOREIGN KEY ("crime_category_id") REFERENCES "public"."crime_categories"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."crime_incidents"
    ADD CONSTRAINT "crime_incidents_crime_id_fkey" FOREIGN KEY ("crime_id") REFERENCES "public"."crimes"("id");



ALTER TABLE ONLY "public"."crime_incidents"
    ADD CONSTRAINT "crime_incidents_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."crimes"
    ADD CONSTRAINT "crimes_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "public"."districts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."demographics"
    ADD CONSTRAINT "demographics_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "public"."districts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."districts"
    ADD CONSTRAINT "districts_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."events"
    ADD CONSTRAINT "events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON UPDATE CASCADE ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."evidence"
    ADD CONSTRAINT "evidence_incident_id_fkey" FOREIGN KEY ("incident_id") REFERENCES "public"."incident_logs"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."incident_logs"
    ADD CONSTRAINT "fk_incident_category" FOREIGN KEY ("category_id") REFERENCES "public"."crime_categories"("id") ON UPDATE CASCADE ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."geographics"
    ADD CONSTRAINT "geographics_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "public"."districts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."incident_logs"
    ADD CONSTRAINT "incident_logs_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."incident_logs"
    ADD CONSTRAINT "incident_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."location_logs"
    ADD CONSTRAINT "location_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."locations"
    ADD CONSTRAINT "locations_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "public"."districts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."locations"
    ADD CONSTRAINT "locations_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON UPDATE CASCADE ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."officers"
    ADD CONSTRAINT "officers_patrol_unit_id_fkey" FOREIGN KEY ("patrol_unit_id") REFERENCES "public"."patrol_units"("id") ON UPDATE CASCADE ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."officers"
    ADD CONSTRAINT "officers_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."officers"
    ADD CONSTRAINT "officers_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("code_unit") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."panic_button_logs"
    ADD CONSTRAINT "panic_button_logs_incident_id_fkey" FOREIGN KEY ("incident_id") REFERENCES "public"."incident_logs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."panic_button_logs"
    ADD CONSTRAINT "panic_button_logs_officer_id_fkey" FOREIGN KEY ("officer_id") REFERENCES "public"."officers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."panic_button_logs"
    ADD CONSTRAINT "panic_button_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."patrol_units"
    ADD CONSTRAINT "patrol_units_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."patrol_units"
    ADD CONSTRAINT "patrol_units_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("code_unit") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."permissions"
    ADD CONSTRAINT "permissions_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "public"."resources"("id") ON UPDATE CASCADE ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."permissions"
    ADD CONSTRAINT "permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON UPDATE CASCADE ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON UPDATE CASCADE ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."sessions"
    ADD CONSTRAINT "sessions_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON UPDATE CASCADE ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."sessions"
    ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON UPDATE CASCADE ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."unit_statistics"
    ADD CONSTRAINT "unit_statistics_code_unit_fkey" FOREIGN KEY ("code_unit") REFERENCES "public"."units"("code_unit") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."units"
    ADD CONSTRAINT "units_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."units"
    ADD CONSTRAINT "units_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "public"."districts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_roles_id_fkey" FOREIGN KEY ("roles_id") REFERENCES "public"."roles"("id") ON UPDATE CASCADE ON DELETE RESTRICT;





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "gis" TO "anon";
GRANT USAGE ON SCHEMA "gis" TO "authenticated";
GRANT USAGE ON SCHEMA "gis" TO "prisma";






REVOKE USAGE ON SCHEMA "public" FROM PUBLIC;
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "prisma";








































































































































































GRANT ALL ON FUNCTION "gis"."backfill_resources_and_permissions"() TO "prisma";



GRANT ALL ON FUNCTION "gis"."calculate_distance_to_district_unit"() TO "prisma";



GRANT ALL ON FUNCTION "gis"."calculate_unit_incident_distances"("p_unit_id" character varying, "p_district_id" character varying) TO "prisma";



GRANT ALL ON FUNCTION "gis"."create_resource_and_permissions_for_table"("table_name" "text") TO "prisma";



GRANT ALL ON FUNCTION "gis"."find_nearest_unit"("p_incident_id" character varying) TO "prisma";



GRANT ALL ON FUNCTION "gis"."find_nearest_unit_to_incident"("p_incident_id" integer) TO "prisma";



GRANT ALL ON FUNCTION "gis"."find_units_within_distance"("p_incident_id" integer, "p_max_distance_meters" double precision) TO "prisma";



GRANT ALL ON FUNCTION "gis"."find_units_within_distance"("p_incident_id" character varying, "p_max_distance_meters" double precision) TO "prisma";



GRANT ALL ON FUNCTION "gis"."update_land_area"() TO "prisma";







































GRANT ALL ON TABLE "public"."_prisma_migrations" TO "anon";
GRANT ALL ON TABLE "public"."_prisma_migrations" TO "authenticated";
GRANT ALL ON TABLE "public"."_prisma_migrations" TO "service_role";
GRANT ALL ON TABLE "public"."_prisma_migrations" TO "prisma";



GRANT ALL ON TABLE "public"."cities" TO "anon";
GRANT ALL ON TABLE "public"."cities" TO "authenticated";
GRANT ALL ON TABLE "public"."cities" TO "service_role";
GRANT ALL ON TABLE "public"."cities" TO "prisma";



GRANT ALL ON TABLE "public"."contact_messages" TO "anon";
GRANT ALL ON TABLE "public"."contact_messages" TO "authenticated";
GRANT ALL ON TABLE "public"."contact_messages" TO "service_role";
GRANT ALL ON TABLE "public"."contact_messages" TO "prisma";



GRANT ALL ON TABLE "public"."crime_categories" TO "anon";
GRANT ALL ON TABLE "public"."crime_categories" TO "authenticated";
GRANT ALL ON TABLE "public"."crime_categories" TO "service_role";
GRANT ALL ON TABLE "public"."crime_categories" TO "prisma";



GRANT ALL ON TABLE "public"."crime_incidents" TO "anon";
GRANT ALL ON TABLE "public"."crime_incidents" TO "authenticated";
GRANT ALL ON TABLE "public"."crime_incidents" TO "service_role";
GRANT ALL ON TABLE "public"."crime_incidents" TO "prisma";



GRANT ALL ON TABLE "public"."crimes" TO "anon";
GRANT ALL ON TABLE "public"."crimes" TO "authenticated";
GRANT ALL ON TABLE "public"."crimes" TO "service_role";
GRANT ALL ON TABLE "public"."crimes" TO "prisma";



GRANT ALL ON TABLE "public"."demographics" TO "anon";
GRANT ALL ON TABLE "public"."demographics" TO "authenticated";
GRANT ALL ON TABLE "public"."demographics" TO "service_role";
GRANT ALL ON TABLE "public"."demographics" TO "prisma";



GRANT ALL ON TABLE "public"."districts" TO "anon";
GRANT ALL ON TABLE "public"."districts" TO "authenticated";
GRANT ALL ON TABLE "public"."districts" TO "service_role";
GRANT ALL ON TABLE "public"."districts" TO "prisma";



GRANT ALL ON TABLE "public"."events" TO "anon";
GRANT ALL ON TABLE "public"."events" TO "authenticated";
GRANT ALL ON TABLE "public"."events" TO "service_role";
GRANT ALL ON TABLE "public"."events" TO "prisma";



GRANT ALL ON TABLE "public"."evidence" TO "anon";
GRANT ALL ON TABLE "public"."evidence" TO "authenticated";
GRANT ALL ON TABLE "public"."evidence" TO "service_role";
GRANT ALL ON TABLE "public"."evidence" TO "prisma";



GRANT ALL ON TABLE "public"."geographics" TO "anon";
GRANT ALL ON TABLE "public"."geographics" TO "authenticated";
GRANT ALL ON TABLE "public"."geographics" TO "service_role";
GRANT ALL ON TABLE "public"."geographics" TO "prisma";



GRANT ALL ON TABLE "public"."incident_logs" TO "anon";
GRANT ALL ON TABLE "public"."incident_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."incident_logs" TO "service_role";
GRANT ALL ON TABLE "public"."incident_logs" TO "prisma";



GRANT ALL ON TABLE "public"."location_logs" TO "anon";
GRANT ALL ON TABLE "public"."location_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."location_logs" TO "service_role";
GRANT ALL ON TABLE "public"."location_logs" TO "prisma";



GRANT ALL ON TABLE "public"."locations" TO "anon";
GRANT ALL ON TABLE "public"."locations" TO "authenticated";
GRANT ALL ON TABLE "public"."locations" TO "service_role";
GRANT ALL ON TABLE "public"."locations" TO "prisma";



GRANT ALL ON TABLE "public"."logs" TO "anon";
GRANT ALL ON TABLE "public"."logs" TO "authenticated";
GRANT ALL ON TABLE "public"."logs" TO "service_role";
GRANT ALL ON TABLE "public"."logs" TO "prisma";



GRANT ALL ON TABLE "public"."officers" TO "anon";
GRANT ALL ON TABLE "public"."officers" TO "authenticated";
GRANT ALL ON TABLE "public"."officers" TO "service_role";
GRANT ALL ON TABLE "public"."officers" TO "prisma";



GRANT ALL ON TABLE "public"."panic_button_logs" TO "anon";
GRANT ALL ON TABLE "public"."panic_button_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."panic_button_logs" TO "service_role";
GRANT ALL ON TABLE "public"."panic_button_logs" TO "prisma";



GRANT ALL ON TABLE "public"."patrol_units" TO "anon";
GRANT ALL ON TABLE "public"."patrol_units" TO "authenticated";
GRANT ALL ON TABLE "public"."patrol_units" TO "service_role";
GRANT ALL ON TABLE "public"."patrol_units" TO "prisma";



GRANT ALL ON TABLE "public"."permissions" TO "anon";
GRANT ALL ON TABLE "public"."permissions" TO "authenticated";
GRANT ALL ON TABLE "public"."permissions" TO "service_role";
GRANT ALL ON TABLE "public"."permissions" TO "prisma";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";
GRANT ALL ON TABLE "public"."profiles" TO "prisma";



GRANT ALL ON TABLE "public"."resources" TO "anon";
GRANT ALL ON TABLE "public"."resources" TO "authenticated";
GRANT ALL ON TABLE "public"."resources" TO "service_role";
GRANT ALL ON TABLE "public"."resources" TO "prisma";



GRANT ALL ON TABLE "public"."roles" TO "anon";
GRANT ALL ON TABLE "public"."roles" TO "authenticated";
GRANT ALL ON TABLE "public"."roles" TO "service_role";
GRANT ALL ON TABLE "public"."roles" TO "prisma";



GRANT ALL ON TABLE "public"."sessions" TO "anon";
GRANT ALL ON TABLE "public"."sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."sessions" TO "service_role";
GRANT ALL ON TABLE "public"."sessions" TO "prisma";



GRANT ALL ON TABLE "public"."unit_statistics" TO "anon";
GRANT ALL ON TABLE "public"."unit_statistics" TO "authenticated";
GRANT ALL ON TABLE "public"."unit_statistics" TO "service_role";
GRANT ALL ON TABLE "public"."unit_statistics" TO "prisma";



GRANT ALL ON TABLE "public"."units" TO "anon";
GRANT ALL ON TABLE "public"."units" TO "authenticated";
GRANT ALL ON TABLE "public"."units" TO "service_role";
GRANT ALL ON TABLE "public"."units" TO "prisma";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";
GRANT ALL ON TABLE "public"."users" TO "prisma";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "gis" GRANT ALL ON SEQUENCES  TO "prisma";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "gis" GRANT ALL ON FUNCTIONS  TO "prisma";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "gis" GRANT ALL ON TABLES  TO "prisma";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "prisma";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "prisma";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "prisma";



























RESET ALL;
