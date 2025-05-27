-- CreateExtension
CREATE SCHEMA IF NOT EXISTS "extensions";

CREATE SCHEMA IF NOT EXISTS "gis";

CREATE SCHEMA IF NOT EXISTS "pgsodium";

CREATE SCHEMA IF NOT EXISTS "vault";

CREATE SCHEMA IF NOT EXISTS graphql;

CREATE EXTENSION IF NOT EXISTS pg_graphql WITH SCHEMA graphql;

CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS pgsodium WITH SCHEMA "pgsodium";
CREATE EXTENSION IF NOT EXISTS supabase_vault WITH SCHEMA "vault";
CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA extensions;

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

CREATE EXTENSION IF NOT EXISTS pgjwt WITH SCHEMA extensions;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";


CREATE EXTENSION IF NOT EXISTS "postgis" WITH SCHEMA "gis";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "postgis" WITH SCHEMA "gis";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";

-- CreateEnum
CREATE TYPE "session_status" AS ENUM ('active', 'completed');

-- CreateEnum
CREATE TYPE "status_contact_messages" AS ENUM ('new', 'read', 'replied', 'closed');

-- CreateEnum
CREATE TYPE "crime_rates" AS ENUM ('low', 'medium', 'high', 'critical');

-- CreateEnum
CREATE TYPE "crime_status" AS ENUM ('open', 'closed', 'under_investigation', 'resolved', 'unresolved');

-- CreateEnum
CREATE TYPE "unit_type" AS ENUM ('polda', 'polsek', 'polres', 'other');



-- CreateTable
CREATE TABLE "profiles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "avatar" VARCHAR(355),
    "username" VARCHAR(255),
    "first_name" VARCHAR(255),
    "last_name" VARCHAR(255),
    "bio" VARCHAR,
    "address" JSON,
    "birth_date" TIMESTAMP(3),

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "roles_id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20),
    "encrypted_password" VARCHAR(255),
    "invited_at" TIMESTAMPTZ(6),
    "confirmed_at" TIMESTAMPTZ(6),
    "email_confirmed_at" TIMESTAMPTZ(6),
    "recovery_sent_at" TIMESTAMPTZ(6),
    "last_sign_in_at" TIMESTAMPTZ(6),
    "app_metadata" JSONB,
    "user_metadata" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "banned_until" TIMESTAMPTZ(6),
    "is_anonymous" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "event_id" UUID NOT NULL,
    "status" "session_status" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "description" VARCHAR(255),
    "code" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" UUID NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resources" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "type" TEXT,
    "description" TEXT,
    "instance_role" TEXT,
    "relations" TEXT,
    "attributes" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "action" TEXT NOT NULL,
    "resource_id" UUID NOT NULL,
    "role_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cities" (
    "id" VARCHAR(20) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crime_incidents" (
    "id" VARCHAR(20) NOT NULL,
    "crime_id" VARCHAR(20) NOT NULL,
    "crime_category_id" VARCHAR(20) NOT NULL,
    "location_id" UUID NOT NULL,
    "description" TEXT NOT NULL,
    "victim_count" INTEGER NOT NULL,
    "status" "crime_status" DEFAULT 'open',
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "timestamp" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "crime_incidents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crime_categories" (
    "id" VARCHAR(20) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "type" VARCHAR(100),

    CONSTRAINT "crime_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crimes" (
    "id" VARCHAR(20) NOT NULL,
    "district_id" VARCHAR(20) NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "level" "crime_rates" NOT NULL DEFAULT 'low',
    "method" VARCHAR(100),
    "month" INTEGER,
    "number_of_crime" INTEGER NOT NULL DEFAULT 0,
    "score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "year" INTEGER,

    CONSTRAINT "crimes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "demographics" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "district_id" VARCHAR(20) NOT NULL,
    "population" INTEGER NOT NULL,
    "number_of_unemployed" INTEGER NOT NULL,
    "population_density" DOUBLE PRECISION NOT NULL,
    "year" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "demographics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "districts" (
    "id" VARCHAR(20) NOT NULL,
    "city_id" VARCHAR(20) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "districts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "locations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "district_id" VARCHAR(20) NOT NULL,
    "event_id" UUID NOT NULL,
    "address" VARCHAR(255),
    "type" VARCHAR(100),
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "land_area" DOUBLE PRECISION,
    "polygon" gis.geometry,
    "geometry" gis.geometry,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "location" gis.geography NOT NULL,

    CONSTRAINT "locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incident_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "location_id" UUID NOT NULL,
    "category_id" VARCHAR(20) NOT NULL,
    "description" TEXT,
    "source" TEXT DEFAULT 'manual',
    "time" TIMESTAMPTZ(6) NOT NULL,
    "verified" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "incident_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "units" (
    "code_unit" VARCHAR(20) NOT NULL,
    "district_id" VARCHAR(20) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "type" "unit_type" NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "address" TEXT,
    "land_area" DOUBLE PRECISION,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "location" gis.geography NOT NULL
);

-- CreateTable
CREATE TABLE "unit_statistics" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code_unit" VARCHAR(20) NOT NULL,
    "crime_total" INTEGER NOT NULL,
    "crime_cleared" INTEGER NOT NULL,
    "percentage" DOUBLE PRECISION,
    "pending" INTEGER,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "unit_statistics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "geographics" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "district_id" VARCHAR(20) NOT NULL,
    "address" TEXT,
    "longitude" DOUBLE PRECISION NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "land_area" DOUBLE PRECISION,
    "polygon" gis.geometry,
    "geometry" gis.geometry,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT,
    "type" VARCHAR(100),
    "location" gis.geography NOT NULL,
    "year" INTEGER,

    CONSTRAINT "geographics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_messages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(255),
    "email" VARCHAR(255),
    "phone" VARCHAR(20),
    "message_type" VARCHAR(50),
    "message_type_label" VARCHAR(50),
    "message" TEXT,
    "status" "status_contact_messages" NOT NULL DEFAULT 'new',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "contact_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "action" VARCHAR(100) NOT NULL,
    "entity" VARCHAR(100) NOT NULL,
    "entity_id" VARCHAR(100),
    "changes" JSONB,
    "user_id" VARCHAR(100),
    "ip_address" VARCHAR(100),
    "user_agent" VARCHAR(255),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profiles_user_id_key" ON "profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_username_key" ON "profiles"("username");

-- CreateIndex
CREATE INDEX "profiles_user_id_idx" ON "profiles"("user_id");

-- CreateIndex
CREATE INDEX "profiles_username_idx" ON "profiles"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE INDEX "users_is_anonymous_idx" ON "users"("is_anonymous");

-- CreateIndex
CREATE INDEX "users_created_at_idx" ON "users"("created_at");

-- CreateIndex
CREATE INDEX "users_updated_at_idx" ON "users"("updated_at");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE INDEX "idx_sessions_user_id" ON "sessions"("user_id");

-- CreateIndex
CREATE INDEX "idx_sessions_event_id" ON "sessions"("event_id");

-- CreateIndex
CREATE INDEX "idx_sessions_status" ON "sessions"("status");

-- CreateIndex
CREATE UNIQUE INDEX "events_code_key" ON "events"("code");

-- CreateIndex
CREATE INDEX "idx_events_name" ON "events"("name");

-- CreateIndex
CREATE INDEX "idx_events_code" ON "events"("code");

-- CreateIndex
CREATE INDEX "idx_events_id" ON "events"("id");

-- CreateIndex
CREATE UNIQUE INDEX "resources_name_key" ON "resources"("name");

-- CreateIndex
CREATE INDEX "idx_cities_name" ON "cities"("name");

-- CreateIndex
CREATE INDEX "idx_crime_incidents_crime_category_id" ON "crime_incidents"("crime_category_id");

-- CreateIndex
CREATE INDEX "idx_crime_incidents_date" ON "crime_incidents"("timestamp");

-- CreateIndex
CREATE INDEX "idx_crime_incidents_location_id" ON "crime_incidents"("location_id");

-- CreateIndex
CREATE INDEX "idx_crime_incidents_crime_id" ON "crime_incidents"("crime_id");

-- CreateIndex
CREATE INDEX "idx_crime_incidents_status" ON "crime_incidents"("status");

-- CreateIndex
CREATE INDEX "idx_crime_categories_name" ON "crime_categories"("name");

-- CreateIndex
CREATE INDEX "idx_crimes_district_id_year_month" ON "crimes"("district_id", "year", "month");

-- CreateIndex
CREATE INDEX "idx_crimes_month_year" ON "crimes"("month", "year");

-- CreateIndex
CREATE INDEX "idx_crimes_month" ON "crimes"("month");

-- CreateIndex
CREATE INDEX "idx_crimes_year" ON "crimes"("year");

-- CreateIndex
CREATE INDEX "idx_crimes_district_id_month" ON "crimes"("district_id", "month");

-- CreateIndex
CREATE INDEX "idx_demographics_year" ON "demographics"("year");

-- CreateIndex
CREATE UNIQUE INDEX "demographics_district_id_year_key" ON "demographics"("district_id", "year");

-- CreateIndex
CREATE INDEX "idx_districts_city_id" ON "districts"("city_id");

-- CreateIndex
CREATE INDEX "idx_districts_name" ON "districts"("name");

-- CreateIndex
CREATE INDEX "idx_locations_district_id" ON "locations"("district_id");

-- CreateIndex
CREATE INDEX "idx_locations_type" ON "locations"("type");

-- CreateIndex
CREATE INDEX "idx_locations_geography" ON "locations" USING GIST ("location");

-- CreateIndex
CREATE INDEX "idx_incident_logs_category_id" ON "incident_logs"("category_id");

-- CreateIndex
CREATE INDEX "idx_incident_logs_time" ON "incident_logs"("time");

-- CreateIndex
CREATE UNIQUE INDEX "units_code_unit_key" ON "units"("code_unit");

-- CreateIndex
CREATE INDEX "idx_units_name" ON "units"("name");

-- CreateIndex
CREATE INDEX "idx_units_type" ON "units"("type");

-- CreateIndex
CREATE INDEX "idx_units_code_unit" ON "units"("code_unit");

-- CreateIndex
CREATE INDEX "idx_units_district_id" ON "units"("district_id");

-- CreateIndex
CREATE INDEX "idx_unit_location" ON "units" USING GIST ("location");

-- CreateIndex
CREATE INDEX "idx_unit_statistics_year_month" ON "unit_statistics"("year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "unit_statistics_code_unit_month_year_key" ON "unit_statistics"("code_unit", "month", "year");

-- CreateIndex
CREATE INDEX "idx_geographics_district_id" ON "geographics"("district_id");

-- CreateIndex
CREATE INDEX "idx_geographics_type" ON "geographics"("type");

-- CreateIndex
CREATE INDEX "idx_geographics_district_id_year" ON "geographics"("district_id", "year");

-- CreateIndex
CREATE INDEX "idx_geographics_location" ON "geographics" USING GIST ("location");

-- CreateIndex
CREATE INDEX "logs_entity_idx" ON "logs"("entity");

-- CreateIndex
CREATE INDEX "logs_user_id_idx" ON "logs"("user_id");

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_roles_id_fkey" FOREIGN KEY ("roles_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permissions" ADD CONSTRAINT "permissions_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "resources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permissions" ADD CONSTRAINT "permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crime_incidents" ADD CONSTRAINT "crime_incidents_crime_category_id_fkey" FOREIGN KEY ("crime_category_id") REFERENCES "crime_categories"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "crime_incidents" ADD CONSTRAINT "crime_incidents_crime_id_fkey" FOREIGN KEY ("crime_id") REFERENCES "crimes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "crime_incidents" ADD CONSTRAINT "crime_incidents_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "crimes" ADD CONSTRAINT "crimes_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "districts"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "demographics" ADD CONSTRAINT "demographics_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "districts"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "districts" ADD CONSTRAINT "districts_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "locations" ADD CONSTRAINT "locations_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "districts"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "locations" ADD CONSTRAINT "locations_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incident_logs" ADD CONSTRAINT "fk_incident_category" FOREIGN KEY ("category_id") REFERENCES "crime_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incident_logs" ADD CONSTRAINT "incident_logs_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "incident_logs" ADD CONSTRAINT "incident_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "units" ADD CONSTRAINT "units_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "districts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unit_statistics" ADD CONSTRAINT "unit_statistics_code_unit_fkey" FOREIGN KEY ("code_unit") REFERENCES "units"("code_unit") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "geographics" ADD CONSTRAINT "geographics_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "districts"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
