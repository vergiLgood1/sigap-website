set check_function_bodies = off;

CREATE OR REPLACE FUNCTION gis.nearby_units(lat double precision, lon double precision, max_results integer DEFAULT 5)
 RETURNS TABLE(code_unit character varying, name text, type text, address text, district_id character varying, lat_unit double precision, lon_unit double precision, distance_km double precision)
 LANGUAGE sql
AS $function$
  select
    u.code_unit,
    u.name,
    u.type,
    u.address,
    u.district_id,
    gis.ST_Y(u.location::gis.geometry) as lat_unit,
    gis.ST_X(u.location::gis.geometry) as lon_unit,
    gis.ST_Distance(
      u.location::gis.geography,
      gis.ST_SetSRID(gis.ST_MakePoint(lon, lat), 4326)::gis.geography
    ) / 1000 as distance_km
  from units u
  order by gis.ST_Distance(
    u.location::gis.geography,
    gis.ST_SetSRID(gis.ST_MakePoint(lon, lat), 4326)::gis.geography
  )
  limit max_results
$function$
;

CREATE OR REPLACE FUNCTION gis.update_location_distance_to_unit()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    loc_lat FLOAT;
    loc_lng FLOAT;
    unit_lat FLOAT;
    unit_lng FLOAT;
    loc_point gis.GEOGRAPHY;
    unit_point gis.GEOGRAPHY;
BEGIN
    -- Ambil lat/lng dari location yang baru
    SELECT gis.ST_Y(NEW.location::gis.geometry), gis.ST_X(NEW.location::gis.geometry)
    INTO loc_lat, loc_lng;

    -- Ambil lat/lng dari unit di distrik yang sama
    SELECT gis.ST_Y(u.location::gis.geometry), gis.ST_X(u.location::gis.geometry)
    INTO unit_lat, unit_lng
    FROM units u
    WHERE u.district_id = NEW.district_id
    LIMIT 1;

    -- Jika tidak ada unit di distrik yang sama, kembalikan NEW tanpa perubahan
    IF unit_lat IS NULL OR unit_lng IS NULL THEN
        RETURN NEW;
    END IF;

    -- Buat point geography dari lat/lng
    loc_point := gis.ST_SetSRID(gis.ST_MakePoint(loc_lng, loc_lat), 4326)::gis.geography;
    unit_point := gis.ST_SetSRID(gis.ST_MakePoint(unit_lng, unit_lat), 4326)::gis.geography;

    -- Update jaraknya ke kolom distance_to_unit
    NEW.distance_to_unit := gis.ST_Distance(loc_point, unit_point) / 1000;

    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION gis.update_land_area()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.land_area := ROUND((ST_Area(NEW.geometry::geography) / 1000000.0)::numeric, 2);
  RETURN NEW;
END;
$function$
;


drop trigger if exists "trg_update_land_area" on "public"."geographics";

drop trigger if exists "location_distance_to_unit_trigger" on "public"."locations";

-- Drop the trigger first
drop trigger if exists location_distance_to_unit_trigger on public.locations;

-- Drop all triggers on public.locations that use public.update_location_distance_to_unit()
DO $$
DECLARE
  trig record;
BEGIN
  FOR trig IN
    SELECT tgname
    FROM pg_trigger
    WHERE tgrelid = 'public.locations'::regclass
      AND NOT tgisinternal
      AND tgfoid = 'public.update_location_distance_to_unit()'::regprocedure
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.locations;', trig.tgname);
  END LOOP;
END
$$;

-- Now drop the trigger function
drop function if exists public.update_location_distance_to_unit();

-- Now we can safely alter the column type
alter table "public"."locations" alter column "location" set data type gis.geography using "location"::gis.geography;

-- Recreate the trigger function
CREATE OR REPLACE FUNCTION public.update_location_distance_to_unit()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    loc_lat FLOAT;
    loc_lng FLOAT;
    unit_lat FLOAT;
    unit_lng FLOAT;
    loc_point gis.GEOGRAPHY;
    unit_point gis.GEOGRAPHY;
BEGIN
    -- Ambil lat/lng dari location yang baru
    SELECT gis.ST_Y(NEW.location::gis.geometry), gis.ST_X(NEW.location::gis.geometry)
    INTO loc_lat, loc_lng;

    -- Ambil lat/lng dari unit di distrik yang sama
    SELECT gis.ST_Y(u.location::gis.geometry), gis.ST_X(u.location::gis.geometry)
    INTO unit_lat, unit_lng
    FROM units u
    WHERE u.district_id = NEW.district_id
    LIMIT 1;

    -- Jika tidak ada unit di distrik yang sama, kembalikan NEW tanpa perubahan
    IF unit_lat IS NULL OR unit_lng IS NULL THEN
        RETURN NEW;
    END IF;

    -- Buat point geography dari lat/lng
    loc_point := gis.ST_SetSRID(gis.ST_MakePoint(loc_lng, loc_lat), 4326)::gis.geography;
    unit_point := gis.ST_SetSRID(gis.ST_MakePoint(unit_lng, unit_lat), 4326)::gis.geography;

    -- Update jaraknya ke kolom distance_to_unit
    NEW.distance_to_unit := gis.ST_Distance(loc_point, unit_point) / 1000;

    RETURN NEW;
END;
$function$
;

-- Recreate the trigger
CREATE TRIGGER location_distance_to_unit_trigger
BEFORE INSERT OR UPDATE OF location ON public.locations
FOR EACH ROW
EXECUTE FUNCTION public.update_location_distance_to_unit();

-- drop policy "give all access to users" on "public"."geographics";

-- Check if constraint exists before attempting to drop it
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'unit_statistics_unit_id_fkey' 
    AND table_name = 'unit_statistics'
  ) THEN
    ALTER TABLE "public"."unit_statistics" DROP CONSTRAINT "unit_statistics_unit_id_fkey";
  END IF;
END
$$;

drop view if exists "public"."location_paths";

drop function if exists "public"."update_land_area"();

drop function if exists "public"."update_timestamp"();

alter table "public"."units" drop constraint "units_pkey";

drop index if exists "public"."unit_statistics_unit_id_month_year_key";

drop index if exists "public"."units_pkey";

-- Check if _prisma_migrations table exists before trying to create it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = '_prisma_migrations'
  ) THEN
    CREATE TABLE "public"."_prisma_migrations" (
        "id" character varying(36) not null,
        "checksum" character varying(64) not null,
        "finished_at" timestamp with time zone,
        "migration_name" character varying(255) not null,
        "logs" text,
        "rolled_back_at" timestamp with time zone,
        "started_at" timestamp with time zone not null default now(),
        "applied_steps_count" integer not null default 0
    );
  END IF;
END
$$;

-- Also wrap other table creations with existence checks
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'evidence'
  ) THEN
    create table "public"."evidence" (
        "incident_id" uuid not null,
        "type" character varying(50) not null,
        "url" text not null,
        "uploaded_at" timestamp(6) with time zone default CURRENT_TIMESTAMP,
        "caption" character varying(255),
        "description" character varying(255),
        "metadata" jsonb,
        "id" character varying(20) not null
    );
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'officers'
  ) THEN
    create table "public"."officers" (
        "unit_id" character varying(20) not null,
        "role_id" uuid not null,
        "nrp" character varying(100) not null,
        "name" character varying(100) not null,
        "rank" character varying(100),
        "position" character varying(100),
        "phone" character varying(20),
        "email" character varying(255),
        "avatar" text,
        "valid_until" timestamp(3) without time zone,
        "qr_code" text,
        "created_at" timestamp(6) with time zone default CURRENT_TIMESTAMP,
        "updated_at" timestamp(6) with time zone default CURRENT_TIMESTAMP,
        "patrol_unit_id" character varying(100) not null,
        "id" uuid not null default gen_random_uuid(),
        "banned_reason" character varying(255),
        "banned_until" timestamp(3) without time zone,
        "is_banned" boolean not null default false,
        "panic_strike" integer not null default 0,
        "spoofing_attempts" integer not null default 0
    );
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'panic_button_logs'
  ) THEN
    create table "public"."panic_button_logs" (
        "id" uuid not null default gen_random_uuid(),
        "user_id" uuid not null,
        "officer_id" uuid,
        "incident_id" uuid not null,
        "timestamp" timestamp(6) with time zone not null
    );
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'patrol_units'
  ) THEN
    create table "public"."patrol_units" (
        "unit_id" character varying(20) not null,
        "location_id" uuid not null,
        "name" character varying(100) not null,
        "type" character varying(50) not null,
        "status" character varying(50) not null,
        "radius" double precision not null,
        "created_at" timestamp(6) with time zone not null default CURRENT_TIMESTAMP,
        "id" character varying(100) not null
    );
  END IF;
END
$$;

alter table "public"."crimes" add column "avg_crime" double precision not null default 0;

alter table "public"."crimes" add column "crime_cleared" integer not null default 0;

alter table "public"."crimes" add column "source_type" character varying(100);

alter table "public"."crimes" alter column "year" drop not null;

alter table "public"."geographics" alter column "location" set data type gis.geography using "location"::gis.geography;

alter table "public"."location_logs" alter column "created_at" set default CURRENT_TIMESTAMP;

alter table "public"."location_logs" alter column "created_at" set data type timestamp(6) with time zone using "created_at"::timestamp(6) with time zone;

alter table "public"."location_logs" alter column "location" set data type gis.geography using "location"::gis.geography;

alter table "public"."location_logs" alter column "timestamp" set data type timestamp(6) with time zone using "timestamp"::timestamp(6) with time zone;

alter table "public"."location_logs" alter column "updated_at" set default CURRENT_TIMESTAMP;

alter table "public"."location_logs" alter column "updated_at" set data type timestamp(6) with time zone using "updated_at"::timestamp(6) with time zone;

alter table "public"."locations" add column "distance_to_unit" double precision;

-- First, drop any triggers on the locations table that might use the location column
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgrelid = 'public.locations'::regclass 
    AND tgname = 'location_distance_to_unit_trigger'
  ) THEN
    DROP TRIGGER location_distance_to_unit_trigger ON public.locations;
  END IF;
END
$$;

-- Now we can safely alter the column type
alter table "public"."locations" alter column "location" set data type gis.geography using "location"::gis.geography;

alter table "public"."profiles" add column "nik" character varying(100) not null default ''::character varying;

-- Safely drop unit_id column if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'unit_statistics'
      AND column_name = 'unit_id'
  ) THEN
    ALTER TABLE "public"."unit_statistics" DROP COLUMN "unit_id";
  END IF;
END
$$;

-- Safely add code_unit column if it does not exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'unit_statistics'
      AND column_name = 'code_unit'
  ) THEN
    ALTER TABLE "public"."unit_statistics" ADD COLUMN "code_unit" character varying(20) NOT NULL;
  END IF;
END
$$;

alter table "public"."units" drop column "id";

alter table "public"."units" add column "city_id" character varying(20) not null;

alter table "public"."units" add column "phone" character varying(20);

alter table "public"."units" alter column "district_id" drop not null;

alter table "public"."units" alter column "location" set data type gis.geography using "location"::gis.geography;

alter table "public"."users" add column "banned_reason" character varying(255);

alter table "public"."users" add column "is_banned" boolean not null default false;

alter table "public"."users" add column "panic_strike" integer not null default 0;

alter table "public"."users" add column "spoofing_attempts" integer not null default 0;

CREATE UNIQUE INDEX _prisma_migrations_pkey ON public._prisma_migrations USING btree (id);

CREATE UNIQUE INDEX evidence_id_key ON public.evidence USING btree (id);

CREATE UNIQUE INDEX evidence_pkey ON public.evidence USING btree (id);

CREATE INDEX idx_evidence_incident_id ON public.evidence USING btree (incident_id);

CREATE INDEX idx_officers_name ON public.officers USING btree (name);

CREATE INDEX idx_officers_nrp ON public.officers USING btree (nrp);

CREATE INDEX idx_officers_position ON public.officers USING btree ("position");

CREATE INDEX idx_officers_rank ON public.officers USING btree (rank);

CREATE INDEX idx_officers_unit_id ON public.officers USING btree (unit_id);

CREATE INDEX idx_panic_buttons_user_id ON public.panic_button_logs USING btree (user_id);

CREATE INDEX idx_patrol_units_location_id ON public.patrol_units USING btree (location_id);

CREATE INDEX idx_patrol_units_name ON public.patrol_units USING btree (name);

CREATE INDEX idx_patrol_units_status ON public.patrol_units USING btree (status);

CREATE INDEX idx_patrol_units_type ON public.patrol_units USING btree (type);

CREATE INDEX idx_patrol_units_unit_id ON public.patrol_units USING btree (unit_id);

CREATE INDEX idx_profiles_nik ON public.profiles USING btree (nik);

CREATE UNIQUE INDEX officers_nrp_key ON public.officers USING btree (nrp);

CREATE UNIQUE INDEX officers_pkey ON public.officers USING btree (id);

CREATE UNIQUE INDEX panic_button_logs_pkey ON public.panic_button_logs USING btree (id);

CREATE UNIQUE INDEX patrol_units_id_key ON public.patrol_units USING btree (id);

CREATE UNIQUE INDEX patrol_units_pkey ON public.patrol_units USING btree (id);

CREATE UNIQUE INDEX profiles_nik_key ON public.profiles USING btree (nik);

CREATE UNIQUE INDEX unit_statistics_code_unit_month_year_key ON public.unit_statistics USING btree (code_unit, month, year);

CREATE UNIQUE INDEX units_pkey ON public.units USING btree (code_unit);

alter table "public"."_prisma_migrations" add constraint "_prisma_migrations_pkey" PRIMARY KEY using index "_prisma_migrations_pkey";

alter table "public"."evidence" add constraint "evidence_pkey" PRIMARY KEY using index "evidence_pkey";

alter table "public"."officers" add constraint "officers_pkey" PRIMARY KEY using index "officers_pkey";

alter table "public"."panic_button_logs" add constraint "panic_button_logs_pkey" PRIMARY KEY using index "panic_button_logs_pkey";

alter table "public"."patrol_units" add constraint "patrol_units_pkey" PRIMARY KEY using index "patrol_units_pkey";

alter table "public"."units" add constraint "units_pkey" PRIMARY KEY using index "units_pkey";

alter table "public"."evidence" add constraint "evidence_incident_id_fkey" FOREIGN KEY (incident_id) REFERENCES incident_logs(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."evidence" validate constraint "evidence_incident_id_fkey";

alter table "public"."officers" add constraint "officers_patrol_unit_id_fkey" FOREIGN KEY (patrol_unit_id) REFERENCES patrol_units(id) ON UPDATE CASCADE ON DELETE RESTRICT not valid;

alter table "public"."officers" validate constraint "officers_patrol_unit_id_fkey";

alter table "public"."officers" add constraint "officers_role_id_fkey" FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE not valid;

alter table "public"."officers" validate constraint "officers_role_id_fkey";

alter table "public"."officers" add constraint "officers_unit_id_fkey" FOREIGN KEY (unit_id) REFERENCES units(code_unit) ON DELETE CASCADE not valid;

alter table "public"."officers" validate constraint "officers_unit_id_fkey";

alter table "public"."panic_button_logs" add constraint "panic_button_logs_incident_id_fkey" FOREIGN KEY (incident_id) REFERENCES incident_logs(id) ON DELETE CASCADE not valid;

alter table "public"."panic_button_logs" validate constraint "panic_button_logs_incident_id_fkey";

alter table "public"."panic_button_logs" add constraint "panic_button_logs_officer_id_fkey" FOREIGN KEY (officer_id) REFERENCES officers(id) ON DELETE CASCADE not valid;

alter table "public"."panic_button_logs" validate constraint "panic_button_logs_officer_id_fkey";

alter table "public"."panic_button_logs" add constraint "panic_button_logs_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE not valid;

alter table "public"."panic_button_logs" validate constraint "panic_button_logs_user_id_fkey";

alter table "public"."patrol_units" add constraint "patrol_units_location_id_fkey" FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE not valid;

alter table "public"."patrol_units" validate constraint "patrol_units_location_id_fkey";

alter table "public"."patrol_units" add constraint "patrol_units_unit_id_fkey" FOREIGN KEY (unit_id) REFERENCES units(code_unit) ON DELETE CASCADE not valid;

alter table "public"."patrol_units" validate constraint "patrol_units_unit_id_fkey";

alter table "public"."unit_statistics" add constraint "unit_statistics_code_unit_fkey" FOREIGN KEY (code_unit) REFERENCES units(code_unit) ON DELETE CASCADE not valid;

alter table "public"."unit_statistics" validate constraint "unit_statistics_code_unit_fkey";

alter table "public"."units" add constraint "units_city_id_fkey" FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE not valid;

alter table "public"."units" validate constraint "units_city_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.delete_user()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
delete from auth.users where id = (select auth.uid());
end;
$function$
;

CREATE OR REPLACE FUNCTION public.generate_username(email text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    role_id UUID;
    officer_role_id UUID;
    is_officer BOOLEAN;
    officer_data JSONB;
    unit_id VARCHAR;
BEGIN
    -- Check if the user is registering as an officer
    is_officer := FALSE;
    
    -- Check user_metadata for officer flag
    IF NEW.raw_user_meta_data ? 'is_officer' THEN
        is_officer := (NEW.raw_user_meta_data->>'is_officer')::boolean;
    END IF;
    
    IF is_officer THEN
        -- Get officer role ID
        SELECT id INTO officer_role_id FROM public.roles WHERE name = 'officer' LIMIT 1;
        IF officer_role_id IS NULL THEN
            RAISE EXCEPTION 'Officer role not found';
        END IF;
        
        -- Extract officer data from metadata
        officer_data := NEW.raw_user_meta_data->'officer_data';
        
        -- Get unit ID from metadata
        unit_id := officer_data->>'unit_id';
        IF unit_id IS NULL THEN
            RAISE EXCEPTION 'Unit ID is required for officer registration';
        END IF;
        
        -- Insert into officers table
        INSERT INTO public.officers (
            id,
            unit_id,
            role_id,
            nrp,
            name,
            rank,
            position,
            phone,
            email,
            created_at,
            updated_at
        ) VALUES (
            NEW.id,
            unit_id,
            officer_role_id,
            officer_data->>'nrp',
            COALESCE(officer_data->>'name', NEW.email),
            officer_data->>'rank',
            officer_data->>'position',
            COALESCE(NEW.phone, officer_data->>'phone'),
            NEW.email,
            NEW.created_at,
            NEW.updated_at
        );

        -- Return early since we've handled the officer case
        RETURN NEW;
    ELSE
        -- Standard user registration - Get viewer role ID
        SELECT id INTO role_id FROM public.roles WHERE name = 'viewer' LIMIT 1;
        IF role_id IS NULL THEN
            RAISE EXCEPTION 'Viewer role not found';
        END IF;
        
        -- Insert into users table
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
            role_id,
            NEW.email,
            NEW.phone,
            NEW.encrypted_password,
            NEW.invited_at,
            NEW.confirmed_at,
            NEW.email_confirmed_at,
            NEW.recovery_sent_at,
            NEW.last_sign_in_at,
            NEW.raw_app_meta_data,
            NEW.raw_user_meta_data,
            NEW.created_at,
            NEW.updated_at,
            NEW.banned_until,
            NEW.is_anonymous
        );
        
        -- Insert into profiles table
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
    END IF;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_user_delete()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    is_officer BOOLEAN;
BEGIN
    -- Check if the user is an officer
    is_officer := EXISTS (SELECT 1 FROM public.officers WHERE id = OLD.id);
    
    IF is_officer THEN
        -- Delete officer record
        DELETE FROM public.officers WHERE id = OLD.id;
    ELSE
        -- Delete standard user data
        DELETE FROM public.profiles WHERE user_id = OLD.id;
        DELETE FROM public.users WHERE id = OLD.id;
    END IF;
    
    RETURN OLD;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_user_type_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    is_officer_before BOOLEAN;
    is_officer_after BOOLEAN;
    officer_role_id UUID;
    viewer_role_id UUID;
    officer_data JSONB;
    unit_id VARCHAR;
BEGIN
    -- Determine officer status before and after update
    is_officer_before := EXISTS (SELECT 1 FROM public.officers WHERE id = NEW.id);
    
    -- Check if user_metadata indicates officer status after update
    is_officer_after := FALSE;
    IF NEW.raw_user_meta_data ? 'is_officer' THEN
        is_officer_after := (NEW.raw_user_meta_data->>'is_officer')::boolean;
    END IF;
    
    -- If status changed from regular user to officer
    IF NOT is_officer_before AND is_officer_after THEN
        -- Get officer role ID
        SELECT id INTO officer_role_id FROM public.roles WHERE name = 'officer' LIMIT 1;
        IF officer_role_id IS NULL THEN
            RAISE EXCEPTION 'Officer role not found';
        END IF;
        
        -- Extract officer data from metadata
        officer_data := NEW.raw_user_meta_data->'officer_data';
        
        -- Get unit ID from metadata
        unit_id := officer_data->>'unit_id';
        IF unit_id IS NULL THEN
            RAISE EXCEPTION 'Unit ID is required for officer registration';
        END IF;
        
        -- Insert into officers table
        INSERT INTO public.officers (
            id,
            unit_id,
            role_id,
            nrp,
            name,
            rank,
            position,
            phone,
            email,
            created_at,
            updated_at
        ) VALUES (
            NEW.id,
            unit_id,
            officer_role_id,
            officer_data->>'nrp',
            COALESCE(officer_data->>'name', NEW.email),
            officer_data->>'rank',
            officer_data->>'position',
            COALESCE(NEW.phone, officer_data->>'phone'),
            NEW.email,
            NEW.created_at,
            NEW.updated_at
        );
        
        -- Delete regular user data
        DELETE FROM public.profiles WHERE user_id = NEW.id;
        DELETE FROM public.users WHERE id = NEW.id;
        
    -- If status changed from officer to regular user
    ELSIF is_officer_before AND NOT is_officer_after THEN
        -- Get viewer role ID
        SELECT id INTO viewer_role_id FROM public.roles WHERE name = 'viewer' LIMIT 1;
        IF viewer_role_id IS NULL THEN
            RAISE EXCEPTION 'Viewer role not found';
        END IF;
        
        -- Insert into users table
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
            viewer_role_id,
            NEW.email,
            NEW.phone,
            NEW.encrypted_password,
            NEW.invited_at,
            NEW.confirmed_at,
            NEW.email_confirmed_at,
            NEW.recovery_sent_at,
            NEW.last_sign_in_at,
            NEW.raw_app_meta_data,
            NEW.raw_user_meta_data,
            NEW.created_at,
            NEW.updated_at,
            NEW.banned_until,
            NEW.is_anonymous
        );
        
        -- Insert into profiles table
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
        
        -- Delete officer record
        DELETE FROM public.officers WHERE id = NEW.id;
    END IF;
    
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_user_update()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    is_officer BOOLEAN;
    officer_data JSONB;
BEGIN
    -- Check if the user is an officer
    is_officer := EXISTS (SELECT 1 FROM public.officers WHERE id = NEW.id);
    
    -- Also check if user_metadata indicates officer status (for cases where metadata was updated)
    IF NOT is_officer AND NEW.raw_user_meta_data ? 'is_officer' THEN
        is_officer := (NEW.raw_user_meta_data->>'is_officer')::boolean;
    END IF;
    
    IF is_officer THEN
        -- Extract officer data from metadata if it exists
        IF NEW.raw_user_meta_data ? 'officer_data' THEN
            officer_data := NEW.raw_user_meta_data->'officer_data';
            
            -- Update officer record
            UPDATE public.officers
            SET
                nrp = COALESCE(officer_data->>'nrp', nrp),
                name = COALESCE(officer_data->>'name', name),
                rank = COALESCE(officer_data->>'rank', rank),
                position = COALESCE(officer_data->>'position', position),
                phone = COALESCE(NEW.phone, officer_data->>'phone', phone),
                email = COALESCE(NEW.email, email),
                updated_at = NOW()
            WHERE id = NEW.id;
        ELSE
            -- Basic update with available auth data
            UPDATE public.officers
            SET
                phone = COALESCE(NEW.phone, phone),
                email = COALESCE(NEW.email, email),
                updated_at = NOW()
            WHERE id = NEW.id;
        END IF;
    ELSE
        -- Standard user update
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

        -- Create profile if it doesn't exist
        INSERT INTO public.profiles (id, user_id, username)
        SELECT gen_random_uuid(), NEW.id, public.generate_username(NEW.email)
        WHERE NOT EXISTS (
            SELECT 1 FROM public.profiles WHERE user_id = NEW.id
        )
        ON CONFLICT (user_id) DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.nearby_units(lat double precision, lon double precision, max_results integer DEFAULT 5)
 RETURNS TABLE(code_unit character varying, name text, type text, address text, district_id character varying, lat_unit double precision, lon_unit double precision, distance_km double precision)
 LANGUAGE sql
AS $function$
  select
    u.code_unit,
    u.name,
    u.type,
    u.address,
    u.district_id,
    gis.ST_Y(u.location::gis.geometry) as lat_unit,
    gis.ST_X(u.location::gis.geometry) as lon_unit,
    gis.ST_Distance(
      u.location::gis.geography,
      gis.ST_SetSRID(gis.ST_MakePoint(lon, lat), 4326)::gis.geography
    ) / 1000 as distance_km
  from units u
  order by gis.ST_Distance(
    u.location::gis.geography,
    gis.ST_SetSRID(gis.ST_MakePoint(lon, lat), 4326)::gis.geography
  )
  limit max_results
$function$
;

CREATE OR REPLACE FUNCTION public.update_location_distance_to_unit()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    loc_lat FLOAT;
    loc_lng FLOAT;
    unit_lat FLOAT;
    unit_lng FLOAT;
    loc_point gis.GEOGRAPHY;
    unit_point gis.GEOGRAPHY;
BEGIN
    -- Ambil lat/lng dari location yang baru
    SELECT gis.ST_Y(NEW.location::gis.geometry), gis.ST_X(NEW.location::gis.geometry)
    INTO loc_lat, loc_lng;

    -- Ambil lat/lng dari unit di distrik yang sama
    SELECT gis.ST_Y(u.location::gis.geometry), gis.ST_X(u.location::gis.geometry)
    INTO unit_lat, unit_lng
    FROM units u
    WHERE u.district_id = NEW.district_id
    LIMIT 1;

    -- Jika tidak ada unit di distrik yang sama, kembalikan NEW tanpa perubahan
    IF unit_lat IS NULL OR unit_lng IS NULL THEN
        RETURN NEW;
    END IF;

    -- Buat point geography dari lat/lng
    loc_point := gis.ST_SetSRID(gis.ST_MakePoint(loc_lng, loc_lat), 4326)::gis.geography;
    unit_point := gis.ST_SetSRID(gis.ST_MakePoint(unit_lng, unit_lat), 4326)::gis.geography;

    -- Update jaraknya ke kolom distance_to_unit
    NEW.distance_to_unit := gis.ST_Distance(loc_point, unit_point) / 1000;

    RETURN NEW;
END;
$function$
;

grant delete on table "public"."_prisma_migrations" to "anon";

grant insert on table "public"."_prisma_migrations" to "anon";

grant references on table "public"."_prisma_migrations" to "anon";

grant select on table "public"."_prisma_migrations" to "anon";

grant trigger on table "public"."_prisma_migrations" to "anon";

grant truncate on table "public"."_prisma_migrations" to "anon";

grant update on table "public"."_prisma_migrations" to "anon";

grant delete on table "public"."_prisma_migrations" to "authenticated";

grant insert on table "public"."_prisma_migrations" to "authenticated";

grant references on table "public"."_prisma_migrations" to "authenticated";

grant select on table "public"."_prisma_migrations" to "authenticated";

grant trigger on table "public"."_prisma_migrations" to "authenticated";

grant truncate on table "public"."_prisma_migrations" to "authenticated";

grant update on table "public"."_prisma_migrations" to "authenticated";

grant delete on table "public"."_prisma_migrations" to "prisma";

grant insert on table "public"."_prisma_migrations" to "prisma";

grant references on table "public"."_prisma_migrations" to "prisma";

grant select on table "public"."_prisma_migrations" to "prisma";

grant trigger on table "public"."_prisma_migrations" to "prisma";

grant truncate on table "public"."_prisma_migrations" to "prisma";

grant update on table "public"."_prisma_migrations" to "prisma";

grant delete on table "public"."_prisma_migrations" to "service_role";

grant insert on table "public"."_prisma_migrations" to "service_role";

grant references on table "public"."_prisma_migrations" to "service_role";

grant select on table "public"."_prisma_migrations" to "service_role";

grant trigger on table "public"."_prisma_migrations" to "service_role";

grant truncate on table "public"."_prisma_migrations" to "service_role";

grant update on table "public"."_prisma_migrations" to "service_role";

grant delete on table "public"."evidence" to "anon";

grant insert on table "public"."evidence" to "anon";

grant references on table "public"."evidence" to "anon";

grant select on table "public"."evidence" to "anon";

grant trigger on table "public"."evidence" to "anon";

grant truncate on table "public"."evidence" to "anon";

grant update on table "public"."evidence" to "anon";

grant delete on table "public"."evidence" to "authenticated";

grant insert on table "public"."evidence" to "authenticated";

grant references on table "public"."evidence" to "authenticated";

grant select on table "public"."evidence" to "authenticated";

grant trigger on table "public"."evidence" to "authenticated";

grant truncate on table "public"."evidence" to "authenticated";

grant update on table "public"."evidence" to "authenticated";

grant delete on table "public"."evidence" to "prisma";

grant insert on table "public"."evidence" to "prisma";

grant references on table "public"."evidence" to "prisma";

grant select on table "public"."evidence" to "prisma";

grant trigger on table "public"."evidence" to "prisma";

grant truncate on table "public"."evidence" to "prisma";

grant update on table "public"."evidence" to "prisma";

grant delete on table "public"."evidence" to "service_role";

grant insert on table "public"."evidence" to "service_role";

grant references on table "public"."evidence" to "service_role";

grant select on table "public"."evidence" to "service_role";

grant trigger on table "public"."evidence" to "service_role";

grant truncate on table "public"."evidence" to "service_role";

grant update on table "public"."evidence" to "service_role";

grant delete on table "public"."officers" to "anon";

grant insert on table "public"."officers" to "anon";

grant references on table "public"."officers" to "anon";

grant select on table "public"."officers" to "anon";

grant trigger on table "public"."officers" to "anon";

grant truncate on table "public"."officers" to "anon";

grant update on table "public"."officers" to "anon";

grant delete on table "public"."officers" to "authenticated";

grant insert on table "public"."officers" to "authenticated";

grant references on table "public"."officers" to "authenticated";

grant select on table "public"."officers" to "authenticated";

grant trigger on table "public"."officers" to "authenticated";

grant truncate on table "public"."officers" to "authenticated";

grant update on table "public"."officers" to "authenticated";

grant delete on table "public"."officers" to "prisma";

grant insert on table "public"."officers" to "prisma";

grant references on table "public"."officers" to "prisma";

grant select on table "public"."officers" to "prisma";

grant trigger on table "public"."officers" to "prisma";

grant truncate on table "public"."officers" to "prisma";

grant update on table "public"."officers" to "prisma";

grant delete on table "public"."officers" to "service_role";

grant insert on table "public"."officers" to "service_role";

grant references on table "public"."officers" to "service_role";

grant select on table "public"."officers" to "service_role";

grant trigger on table "public"."officers" to "service_role";

grant truncate on table "public"."officers" to "service_role";

grant update on table "public"."officers" to "service_role";

grant delete on table "public"."panic_button_logs" to "anon";

grant insert on table "public"."panic_button_logs" to "anon";

grant references on table "public"."panic_button_logs" to "anon";

grant select on table "public"."panic_button_logs" to "anon";

grant trigger on table "public"."panic_button_logs" to "anon";

grant truncate on table "public"."panic_button_logs" to "anon";

grant update on table "public"."panic_button_logs" to "anon";

grant delete on table "public"."panic_button_logs" to "authenticated";

grant insert on table "public"."panic_button_logs" to "authenticated";

grant references on table "public"."panic_button_logs" to "authenticated";

grant select on table "public"."panic_button_logs" to "authenticated";

grant trigger on table "public"."panic_button_logs" to "authenticated";

grant truncate on table "public"."panic_button_logs" to "authenticated";

grant update on table "public"."panic_button_logs" to "authenticated";

grant delete on table "public"."panic_button_logs" to "prisma";

grant insert on table "public"."panic_button_logs" to "prisma";

grant references on table "public"."panic_button_logs" to "prisma";

grant select on table "public"."panic_button_logs" to "prisma";

grant trigger on table "public"."panic_button_logs" to "prisma";

grant truncate on table "public"."panic_button_logs" to "prisma";

grant update on table "public"."panic_button_logs" to "prisma";

grant delete on table "public"."patrol_units" to "anon";

grant insert on table "public"."patrol_units" to "anon";

grant references on table "public"."patrol_units" to "anon";

grant select on table "public"."patrol_units" to "anon";

grant trigger on table "public"."patrol_units" to "anon";

grant truncate on table "public"."patrol_units" to "anon";

grant update on table "public"."patrol_units" to "anon";

grant delete on table "public"."patrol_units" to "authenticated";

grant insert on table "public"."patrol_units" to "authenticated";

grant references on table "public"."patrol_units" to "authenticated";

grant select on table "public"."patrol_units" to "authenticated";

grant trigger on table "public"."patrol_units" to "authenticated";

grant truncate on table "public"."patrol_units" to "authenticated";

grant update on table "public"."patrol_units" to "authenticated";

grant delete on table "public"."patrol_units" to "prisma";

grant insert on table "public"."patrol_units" to "prisma";

grant references on table "public"."patrol_units" to "prisma";

grant select on table "public"."patrol_units" to "prisma";

grant trigger on table "public"."patrol_units" to "prisma";

grant truncate on table "public"."patrol_units" to "prisma";

grant update on table "public"."patrol_units" to "prisma";

grant delete on table "public"."patrol_units" to "service_role";

grant insert on table "public"."patrol_units" to "service_role";

grant references on table "public"."patrol_units" to "service_role";

grant select on table "public"."patrol_units" to "service_role";

grant trigger on table "public"."patrol_units" to "service_role";

grant truncate on table "public"."patrol_units" to "service_role";

grant update on table "public"."patrol_units" to "service_role";


