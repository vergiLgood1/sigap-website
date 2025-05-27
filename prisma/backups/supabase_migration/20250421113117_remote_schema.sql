

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


ALTER SCHEMA "gis" OWNER TO "postgres";


CREATE EXTENSION IF NOT EXISTS "pgsodium";






COMMENT ON SCHEMA "public" IS 'standard public schema';



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


-- ALTER TYPE "public"."crime_rates" OWNER TO "prisma";


CREATE TYPE "public"."crime_status" AS ENUM (
    'open',
    'closed',
    'under_investigation',
    'resolved',
    'unresolved'
);


-- ALTER TYPE "public"."crime_status" OWNER TO "prisma";


CREATE TYPE "public"."session_status" AS ENUM (
    'active',
    'completed'
);


-- ALTER TYPE "public"."session_status" OWNER TO "prisma";


CREATE TYPE "public"."status_contact_messages" AS ENUM (
    'new',
    'read',
    'replied',
    'closed'
);


-- ALTER TYPE "public"."status_contact_messages" OWNER TO "prisma";


CREATE TYPE "public"."unit_type" AS ENUM (
    'polda',
    'polsek',
    'polres',
    'other'
);


-- ALTER TYPE "public"."unit_type" OWNER TO "prisma";


CREATE OR REPLACE FUNCTION "gis"."update_land_area"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.land_area := ROUND((ST_Area(NEW.geometry::geography) / 1000000.0)::numeric, 2);
  RETURN NEW;
END;
$$;


ALTER FUNCTION "gis"."update_land_area"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_username"("email" "text") RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  result_username TEXT;
  username_base TEXT;
  random_number INTEGER;
  username_exists BOOLEAN;
BEGIN
  -- Extract the part before @ from email
  username_base := split_part(email, '@', 1);
  
  -- Remove any special characters and replace with underscore
  username_base := regexp_replace(username_base, '[^a-zA-Z0-9]', '_', 'g');
  
  -- Generate a random number between 100 and 9999
  random_number := floor(random() * 9900 + 100)::integer;
  
  -- Combine the base and random number
  result_username := username_base || random_number;
  
  -- Check if username already exists
  LOOP
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE username = result_username) INTO username_exists;
    
    IF NOT username_exists THEN
      EXIT;
    END IF;
    
    -- Generate a different random number
    random_number := floor(random() * 9900 + 100)::integer;
    result_username := username_base || random_number;
  END LOOP;
  
  RETURN result_username;
END;
$$;


ALTER FUNCTION "public"."generate_username"("email" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    role_id UUID;  -- Declare a variable to store the fetched role ID
BEGIN
    -- Fetch the role ID for 'viewer' from the roles table
    SELECT id INTO role_id FROM public.roles WHERE name = 'viewer' LIMIT 1;

    -- Check if the role ID was found
    IF role_id IS NULL THEN
        RAISE EXCEPTION 'Role not found';
    END IF;

    -- Insert the new user into the public.users table with all available data
    INSERT INTO public.users (
        id,
        roles_id,
        email,
        phone,
        encrypted_password,
        invited_at,
        confirmed_at,
        email_confirmed_at,
        recovery_sent_at,
        last_sign_in_at,
        app_metadata,
        user_metadata,
        created_at,
        updated_at,
        banned_until,
        is_anonymous
    ) VALUES (
        NEW.id,
        role_id,  -- Use the dynamically fetched role ID
        NEW.email,
        NEW.phone,
        NEW.encrypted_password,
        NEW.invited_at,
        NEW.confirmed_at,
        NEW.email_confirmed_at,
        NEW.recovery_sent_at,
        NEW.last_sign_in_at,
        NEW.raw_app_meta_data,  -- Ensure this matches your actual column name
        NEW.raw_user_meta_data, -- Ensure this matches your actual column name
        NEW.created_at,
        NEW.updated_at,
        NEW.banned_until,
        NEW.is_anonymous
    );

    -- Create the associated profile record
    INSERT INTO public.profiles (
        id,
        user_id,
        avatar,
        username,
        first_name,
        last_name,
        bio,
        address,
        birth_date
    ) VALUES (
        gen_random_uuid(),
        NEW.id,
        NULL,
        public.generate_username(NEW.email),
        NULL,
        NULL,
        NULL,
        NULL,
        NULL
    );

    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_user_delete"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$BEGIN
  -- Delete the profile record first due to foreign key constraints
  DELETE FROM public.profiles
  WHERE user_id = OLD.id;
  
  -- Delete the user record
  DELETE FROM public.users
  WHERE id = OLD.id;
  
  RETURN OLD;
END;$$;


ALTER FUNCTION "public"."handle_user_delete"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_user_update"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$BEGIN
  -- Update the public.users table with the latest data
  UPDATE public.users
  SET 
    email = COALESCE(NEW.email, email),
    phone = COALESCE(NEW.phone, phone),
    encrypted_password = COALESCE(NEW.encrypted_password, encrypted_password),
    invited_at = COALESCE(NEW.invited_at, invited_at),
    confirmed_at = COALESCE(NEW.confirmed_at, confirmed_at),
    email_confirmed_at = COALESCE(NEW.email_confirmed_at, email_confirmed_at),
    recovery_sent_at = COALESCE(NEW.recovery_sent_at, recovery_sent_at),
    last_sign_in_at = COALESCE(NEW.last_sign_in_at, last_sign_in_at),
    app_metadata = COALESCE(NEW.raw_app_meta_data, app_metadata),
    user_metadata = COALESCE(NEW.raw_user_meta_data, user_metadata),
    created_at = COALESCE(NEW.created_at, created_at),
    updated_at = NOW(),
    banned_until = CASE 
      WHEN NEW.banned_until IS NULL THEN NULL
      ELSE COALESCE(NEW.banned_until, banned_until)
    END,
    is_anonymous = COALESCE(NEW.is_anonymous, is_anonymous)
  WHERE id = NEW.id;

  -- Create profile record if it doesn't exist
  INSERT INTO public.profiles (id, user_id)
  SELECT gen_random_uuid(), NEW.id
  WHERE NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE user_id = NEW.id
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;$$;


ALTER FUNCTION "public"."handle_user_update"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_land_area"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.land_area := ROUND(ST_Area(NEW.geometry::gis.geography) / 1000000.0);
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_land_area"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_timestamp"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_timestamp"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."cities" (
    "id" character varying(20) NOT NULL,
    "name" character varying(100) NOT NULL,
    "created_at" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP
);


-- ALTER TABLE "public"."cities" OWNER TO "prisma";


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


-- ALTER TABLE "public"."contact_messages" OWNER TO "prisma";


CREATE TABLE IF NOT EXISTS "public"."crime_categories" (
    "id" character varying(20) NOT NULL,
    "name" character varying(255) NOT NULL,
    "description" "text" NOT NULL,
    "created_at" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP,
    "type" character varying(100)
);


-- ALTER TABLE "public"."crime_categories" OWNER TO "prisma";


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


-- ALTER TABLE "public"."crime_incidents" OWNER TO "prisma";


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
    "year" integer NOT NULL
);


-- ALTER TABLE "public"."crimes" OWNER TO "prisma";


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


-- ALTER TABLE "public"."demographics" OWNER TO "prisma";


CREATE TABLE IF NOT EXISTS "public"."districts" (
    "id" character varying(20) NOT NULL,
    "city_id" character varying(20) NOT NULL,
    "name" character varying(100) NOT NULL,
    "created_at" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP
);


-- ALTER TABLE "public"."districts" OWNER TO "prisma";


CREATE TABLE IF NOT EXISTS "public"."events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying(255) NOT NULL,
    "description" character varying(255),
    "code" "text" NOT NULL,
    "created_at" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "user_id" "uuid" NOT NULL
);


-- ALTER TABLE "public"."events" OWNER TO "prisma";


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
    "location" "gis"."geography"(Point,4326) NOT NULL,
    "year" integer
);


-- ALTER TABLE "public"."geographics" OWNER TO "prisma";


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


-- ALTER TABLE "public"."incident_logs" OWNER TO "prisma";


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
    "location" "gis"."geography"(Point,4326) NOT NULL
);


-- ALTER TABLE "public"."locations" OWNER TO "prisma";


CREATE OR REPLACE VIEW "public"."location_paths" AS
 SELECT "l"."event_id",
    "e"."user_id",
    "gis"."st_makeline"(("l"."location")::"gis"."geometry" ORDER BY "l"."created_at") AS "path"
   FROM ("public"."locations" "l"
     JOIN "public"."events" "e" ON (("l"."event_id" = "e"."id")))
  GROUP BY "l"."event_id", "e"."user_id";


ALTER TABLE "public"."location_paths" OWNER TO "postgres";


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


-- ALTER TABLE "public"."logs" OWNER TO "prisma";


CREATE TABLE IF NOT EXISTS "public"."permissions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "action" "text" NOT NULL,
    "resource_id" "uuid" NOT NULL,
    "role_id" "uuid" NOT NULL,
    "created_at" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp(6) with time zone NOT NULL
);


-- ALTER TABLE "public"."permissions" OWNER TO "prisma";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "avatar" character varying(355),
    "username" character varying(255),
    "first_name" character varying(255),
    "last_name" character varying(255),
    "bio" character varying,
    "address" "json",
    "birth_date" timestamp(3) without time zone
);


-- ALTER TABLE "public"."profiles" OWNER TO "prisma";


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


-- ALTER TABLE "public"."resources" OWNER TO "prisma";


CREATE TABLE IF NOT EXISTS "public"."roles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying(255) NOT NULL,
    "description" "text",
    "created_at" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


-- ALTER TABLE "public"."roles" OWNER TO "prisma";


CREATE TABLE IF NOT EXISTS "public"."sessions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "event_id" "uuid" NOT NULL,
    "status" "public"."session_status" DEFAULT 'active'::"public"."session_status" NOT NULL,
    "created_at" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


-- ALTER TABLE "public"."sessions" OWNER TO "prisma";


CREATE TABLE IF NOT EXISTS "public"."unit_statistics" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "unit_id" "uuid" NOT NULL,
    "crime_total" integer NOT NULL,
    "crime_cleared" integer NOT NULL,
    "percentage" double precision,
    "pending" integer,
    "month" integer NOT NULL,
    "year" integer NOT NULL,
    "created_at" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP
);


-- ALTER TABLE "public"."unit_statistics" OWNER TO "prisma";


CREATE TABLE IF NOT EXISTS "public"."units" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "code_unit" character varying(20) NOT NULL,
    "district_id" character varying(20) NOT NULL,
    "name" character varying(100) NOT NULL,
    "description" "text",
    "type" "public"."unit_type" NOT NULL,
    "created_at" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP,
    "address" "text",
    "land_area" double precision,
    "latitude" double precision NOT NULL,
    "longitude" double precision NOT NULL,
    "location" "gis"."geography"(Point,4326) NOT NULL
);


-- ALTER TABLE "public"."units" OWNER TO "prisma";


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
    "is_anonymous" boolean DEFAULT false NOT NULL
);


-- ALTER TABLE "public"."users" OWNER TO "prisma";


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



ALTER TABLE ONLY "public"."geographics"
    ADD CONSTRAINT "geographics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."incident_logs"
    ADD CONSTRAINT "incident_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."locations"
    ADD CONSTRAINT "locations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."logs"
    ADD CONSTRAINT "logs_pkey" PRIMARY KEY ("id");



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
    ADD CONSTRAINT "units_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



CREATE UNIQUE INDEX "demographics_district_id_year_key" ON "public"."demographics" USING "btree" ("district_id", "year");



CREATE UNIQUE INDEX "events_code_key" ON "public"."events" USING "btree" ("code");



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



CREATE INDEX "idx_geographics_district_id" ON "public"."geographics" USING "btree" ("district_id");



CREATE INDEX "idx_geographics_district_id_year" ON "public"."geographics" USING "btree" ("district_id", "year");



CREATE INDEX "idx_geographics_location" ON "public"."geographics" USING "gist" ("location");



CREATE INDEX "idx_geographics_type" ON "public"."geographics" USING "btree" ("type");



CREATE INDEX "idx_incident_logs_category_id" ON "public"."incident_logs" USING "btree" ("category_id");



CREATE INDEX "idx_incident_logs_time" ON "public"."incident_logs" USING "btree" ("time");



CREATE INDEX "idx_locations_district_id" ON "public"."locations" USING "btree" ("district_id");



CREATE INDEX "idx_locations_geography" ON "public"."locations" USING "gist" ("location");



CREATE INDEX "idx_locations_type" ON "public"."locations" USING "btree" ("type");



CREATE INDEX "idx_sessions_event_id" ON "public"."sessions" USING "btree" ("event_id");



CREATE INDEX "idx_sessions_status" ON "public"."sessions" USING "btree" ("status");



CREATE INDEX "idx_sessions_user_id" ON "public"."sessions" USING "btree" ("user_id");



CREATE INDEX "idx_unit_location" ON "public"."units" USING "gist" ("location");



CREATE INDEX "idx_unit_statistics_year_month" ON "public"."unit_statistics" USING "btree" ("year", "month");



CREATE INDEX "idx_units_code_unit" ON "public"."units" USING "btree" ("code_unit");



CREATE INDEX "idx_units_district_id" ON "public"."units" USING "btree" ("district_id");



CREATE INDEX "idx_units_name" ON "public"."units" USING "btree" ("name");



CREATE INDEX "idx_units_type" ON "public"."units" USING "btree" ("type");



CREATE INDEX "logs_entity_idx" ON "public"."logs" USING "btree" ("entity");



CREATE INDEX "logs_user_id_idx" ON "public"."logs" USING "btree" ("user_id");



CREATE INDEX "profiles_user_id_idx" ON "public"."profiles" USING "btree" ("user_id");



CREATE UNIQUE INDEX "profiles_user_id_key" ON "public"."profiles" USING "btree" ("user_id");



CREATE INDEX "profiles_username_idx" ON "public"."profiles" USING "btree" ("username");



CREATE UNIQUE INDEX "profiles_username_key" ON "public"."profiles" USING "btree" ("username");



CREATE UNIQUE INDEX "resources_name_key" ON "public"."resources" USING "btree" ("name");



CREATE UNIQUE INDEX "roles_name_key" ON "public"."roles" USING "btree" ("name");



CREATE UNIQUE INDEX "unit_statistics_unit_id_month_year_key" ON "public"."unit_statistics" USING "btree" ("unit_id", "month", "year");



CREATE UNIQUE INDEX "units_code_unit_key" ON "public"."units" USING "btree" ("code_unit");



CREATE UNIQUE INDEX "units_district_id_key" ON "public"."units" USING "btree" ("district_id");



CREATE INDEX "users_created_at_idx" ON "public"."users" USING "btree" ("created_at");



CREATE UNIQUE INDEX "users_email_key" ON "public"."users" USING "btree" ("email");



CREATE INDEX "users_is_anonymous_idx" ON "public"."users" USING "btree" ("is_anonymous");



CREATE UNIQUE INDEX "users_phone_key" ON "public"."users" USING "btree" ("phone");



CREATE INDEX "users_updated_at_idx" ON "public"."users" USING "btree" ("updated_at");



CREATE OR REPLACE TRIGGER "trg_update_land_area" BEFORE INSERT OR UPDATE ON "public"."geographics" FOR EACH ROW WHEN (("new"."geometry" IS NOT NULL)) EXECUTE FUNCTION "gis"."update_land_area"();

ALTER TABLE "public"."geographics" DISABLE TRIGGER "trg_update_land_area";



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



ALTER TABLE ONLY "public"."incident_logs"
    ADD CONSTRAINT "fk_incident_category" FOREIGN KEY ("category_id") REFERENCES "public"."crime_categories"("id") ON UPDATE CASCADE ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."geographics"
    ADD CONSTRAINT "geographics_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "public"."districts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."incident_logs"
    ADD CONSTRAINT "incident_logs_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."incident_logs"
    ADD CONSTRAINT "incident_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."locations"
    ADD CONSTRAINT "locations_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "public"."districts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."locations"
    ADD CONSTRAINT "locations_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON UPDATE CASCADE ON DELETE RESTRICT;



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
    ADD CONSTRAINT "unit_statistics_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."units"
    ADD CONSTRAINT "units_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "public"."districts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_roles_id_fkey" FOREIGN KEY ("roles_id") REFERENCES "public"."roles"("id") ON UPDATE CASCADE ON DELETE RESTRICT;



CREATE POLICY "give all access to users" ON "public"."geographics" TO "authenticated", "anon", "postgres" USING (true);


ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."locations";



GRANT USAGE ON SCHEMA "gis" TO "anon";
GRANT USAGE ON SCHEMA "gis" TO "authenticated";
-- GRANT USAGE ON SCHEMA "gis" TO "prisma";



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";
-- GRANT ALL ON SCHEMA "public" TO "prisma";




















































































































































































GRANT ALL ON FUNCTION "public"."generate_username"("email" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."generate_username"("email" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_username"("email" "text") TO "service_role";
-- GRANT ALL ON FUNCTION "public"."generate_username"("email" "text") TO "prisma";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";
-- GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "prisma";



GRANT ALL ON FUNCTION "public"."handle_user_delete"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_user_delete"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_user_delete"() TO "service_role";
-- GRANT ALL ON FUNCTION "public"."handle_user_delete"() TO "prisma";



GRANT ALL ON FUNCTION "public"."handle_user_update"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_user_update"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_user_update"() TO "service_role";
-- GRANT ALL ON FUNCTION "public"."handle_user_update"() TO "prisma";



GRANT ALL ON FUNCTION "public"."update_land_area"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_land_area"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_land_area"() TO "service_role";
-- GRANT ALL ON FUNCTION "public"."update_land_area"() TO "prisma";



GRANT ALL ON FUNCTION "public"."update_timestamp"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_timestamp"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_timestamp"() TO "service_role";
-- GRANT ALL ON FUNCTION "public"."update_timestamp"() TO "prisma";


















GRANT SELECT,INSERT,UPDATE ON TABLE "public"."cities" TO "authenticated";
GRANT SELECT,INSERT,UPDATE ON TABLE "public"."cities" TO "anon";
GRANT SELECT,INSERT,UPDATE ON TABLE "public"."cities" TO "postgres";



GRANT SELECT,INSERT,UPDATE ON TABLE "public"."contact_messages" TO "authenticated";
GRANT SELECT,INSERT,UPDATE ON TABLE "public"."contact_messages" TO "anon";
GRANT SELECT,INSERT,UPDATE ON TABLE "public"."contact_messages" TO "postgres";



GRANT SELECT,INSERT,UPDATE ON TABLE "public"."crime_categories" TO "authenticated";
GRANT SELECT,INSERT,UPDATE ON TABLE "public"."crime_categories" TO "anon";
GRANT SELECT,INSERT,UPDATE ON TABLE "public"."crime_categories" TO "postgres";



GRANT SELECT,INSERT,UPDATE ON TABLE "public"."crime_incidents" TO "authenticated";
GRANT SELECT,INSERT,UPDATE ON TABLE "public"."crime_incidents" TO "anon";
GRANT SELECT,INSERT,UPDATE ON TABLE "public"."crime_incidents" TO "postgres";



GRANT SELECT,INSERT,UPDATE ON TABLE "public"."crimes" TO "authenticated";
GRANT SELECT,INSERT,UPDATE ON TABLE "public"."crimes" TO "anon";
GRANT SELECT,INSERT,UPDATE ON TABLE "public"."crimes" TO "postgres";



GRANT SELECT,INSERT,UPDATE ON TABLE "public"."demographics" TO "authenticated";
GRANT SELECT,INSERT,UPDATE ON TABLE "public"."demographics" TO "anon";
GRANT SELECT,INSERT,UPDATE ON TABLE "public"."demographics" TO "postgres";



GRANT SELECT,INSERT,UPDATE ON TABLE "public"."districts" TO "authenticated";
GRANT SELECT,INSERT,UPDATE ON TABLE "public"."districts" TO "anon";
GRANT SELECT,INSERT,UPDATE ON TABLE "public"."districts" TO "postgres";



GRANT SELECT,INSERT,UPDATE ON TABLE "public"."events" TO "authenticated";
GRANT SELECT,INSERT,UPDATE ON TABLE "public"."events" TO "anon";
GRANT SELECT,INSERT,UPDATE ON TABLE "public"."events" TO "postgres";



GRANT SELECT,INSERT,UPDATE ON TABLE "public"."geographics" TO "authenticated";
GRANT SELECT,INSERT,UPDATE ON TABLE "public"."geographics" TO "anon";
GRANT SELECT,INSERT,UPDATE ON TABLE "public"."geographics" TO "postgres";



GRANT SELECT,INSERT,UPDATE ON TABLE "public"."incident_logs" TO "authenticated";
GRANT SELECT,INSERT,UPDATE ON TABLE "public"."incident_logs" TO "anon";
GRANT SELECT,INSERT,UPDATE ON TABLE "public"."incident_logs" TO "postgres";



GRANT SELECT,INSERT,UPDATE ON TABLE "public"."locations" TO "authenticated";
GRANT SELECT,INSERT,UPDATE ON TABLE "public"."locations" TO "anon";
GRANT SELECT,INSERT,UPDATE ON TABLE "public"."locations" TO "postgres";



GRANT ALL ON TABLE "public"."location_paths" TO "anon";
GRANT ALL ON TABLE "public"."location_paths" TO "authenticated";
GRANT ALL ON TABLE "public"."location_paths" TO "service_role";
-- GRANT ALL ON TABLE "public"."location_paths" TO "prisma";



GRANT SELECT,INSERT,UPDATE ON TABLE "public"."logs" TO "authenticated";
GRANT SELECT,INSERT,UPDATE ON TABLE "public"."logs" TO "anon";
GRANT SELECT,INSERT,UPDATE ON TABLE "public"."logs" TO "postgres";



GRANT SELECT,INSERT,UPDATE ON TABLE "public"."permissions" TO "authenticated";
GRANT SELECT,INSERT,UPDATE ON TABLE "public"."permissions" TO "anon";
GRANT SELECT,INSERT,UPDATE ON TABLE "public"."permissions" TO "postgres";



GRANT SELECT,INSERT,UPDATE ON TABLE "public"."profiles" TO "authenticated";
GRANT SELECT,INSERT,UPDATE ON TABLE "public"."profiles" TO "anon";
GRANT SELECT,INSERT,UPDATE ON TABLE "public"."profiles" TO "postgres";



GRANT SELECT,INSERT,UPDATE ON TABLE "public"."resources" TO "authenticated";
GRANT SELECT,INSERT,UPDATE ON TABLE "public"."resources" TO "anon";
GRANT SELECT,INSERT,UPDATE ON TABLE "public"."resources" TO "postgres";



GRANT SELECT,INSERT,UPDATE ON TABLE "public"."roles" TO "authenticated";
GRANT SELECT,INSERT,UPDATE ON TABLE "public"."roles" TO "anon";
GRANT SELECT,INSERT,UPDATE ON TABLE "public"."roles" TO "postgres";



GRANT SELECT,INSERT,UPDATE ON TABLE "public"."sessions" TO "authenticated";
GRANT SELECT,INSERT,UPDATE ON TABLE "public"."sessions" TO "anon";
GRANT SELECT,INSERT,UPDATE ON TABLE "public"."sessions" TO "postgres";



GRANT SELECT,INSERT,UPDATE ON TABLE "public"."unit_statistics" TO "authenticated";
GRANT SELECT,INSERT,UPDATE ON TABLE "public"."unit_statistics" TO "anon";
GRANT SELECT,INSERT,UPDATE ON TABLE "public"."unit_statistics" TO "postgres";



GRANT SELECT,INSERT,UPDATE ON TABLE "public"."units" TO "authenticated";
GRANT SELECT,INSERT,UPDATE ON TABLE "public"."units" TO "anon";
GRANT SELECT,INSERT,UPDATE ON TABLE "public"."units" TO "postgres";



GRANT SELECT,INSERT,UPDATE ON TABLE "public"."users" TO "authenticated";
GRANT SELECT,INSERT,UPDATE ON TABLE "public"."users" TO "anon";
GRANT SELECT,INSERT,UPDATE ON TABLE "public"."users" TO "postgres";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "prisma";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "prisma";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "prisma";






























RESET ALL;
