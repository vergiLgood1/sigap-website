create or replace function public.nearby_units(
  lat double precision,
  lon double precision,
  max_results integer default 5
)
returns table (
  code_unit varchar,
  name text,
  type text,
  address text,
  district_id varchar,
  lat_unit double precision,
  lon_unit double precision,
  distance_km double precision
)
language sql
as $$
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
$$;


CREATE OR REPLACE FUNCTION public.update_location_distance_to_unit()
RETURNS TRIGGER AS $$
DECLARE
    loc_lat FLOAT;
    loc_lng FLOAT;
    unit_lat FLOAT;
    unit_lng FLOAT;
    loc_point GEOGRAPHY;
    unit_point GEOGRAPHY;
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
$$ LANGUAGE plpgsql;

-- Create the trigger
CREATE OR REPLACE TRIGGER update_location_distance_trigger
BEFORE INSERT OR UPDATE OF location, district_id
ON locations
FOR EACH ROW
EXECUTE FUNCTION public.update_location_distance_to_unit();


-- Spatial index untuk tabel units
CREATE INDEX IF NOT EXISTS idx_units_location_gist ON units USING GIST (location);

-- Spatial index untuk tabel locations 
CREATE INDEX IF NOT EXISTS idx_locations_location_gist ON locations USING GIST (location);

-- Index untuk mempercepat pencarian units berdasarkan district_id
CREATE INDEX IF NOT EXISTS idx_units_district_id ON units (district_id);

-- Index untuk mempercepat pencarian locations berdasarkan district_id
CREATE INDEX IF NOT EXISTS idx_locations_district_id ON locations (district_id);

-- Index untuk kombinasi location dan district_id pada tabel units
CREATE INDEX IF NOT EXISTS idx_units_location_district ON units (district_id, location);

-- Analisis tabel setelah membuat index
ANALYZE units;
ANALYZE locations;