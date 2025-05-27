DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'geometry_dump' AND typnamespace = 'gis'::regnamespace
    ) THEN
        CREATE TYPE "gis"."geometry_dump" AS ("path" integer[], "geom" geometry);
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'valid_detail' AND typnamespace = 'gis'::regnamespace
    ) THEN
        CREATE TYPE "gis"."valid_detail" AS ("valid" boolean, "reason" character varying, "location" geometry);
    END IF;
END$$;
