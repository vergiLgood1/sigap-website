-- drop type "gis"."geometry_dump";

-- drop type "gis"."valid_detail";

-- set check_function_bodies = off;

DROP FUNCTION IF EXISTS gis.calculate_unit_incident_distances(VARCHAR, VARCHAR);

DROP FUNCTION IF EXISTS gis.find_nearest_unit(character varying);

DROP FUNCTION IF EXISTS gis.find_units_within_distance(character varying, double precision);

-- DROP FUNCTION IF EXISTS gis.find_units_within_distance(character varying, double precision DEFAULT 5000);



CREATE OR REPLACE FUNCTION gis.calculate_unit_incident_distances(
  p_unit_id VARCHAR,
  p_district_id VARCHAR DEFAULT NULL
)
RETURNS TABLE (
  unit_code VARCHAR,
  incident_id VARCHAR,
  district_name VARCHAR,
  distance_meters FLOAT
) AS $$
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
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION gis.find_nearest_unit(p_incident_id character varying)
 RETURNS TABLE(unit_code character varying, unit_name character varying, distance_meters double precision)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION gis.find_units_within_distance(p_incident_id character varying, p_max_distance_meters double precision DEFAULT 5000)
 RETURNS TABLE(unit_code character varying, unit_name character varying, distance_meters double precision)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

-- create type "gis"."geometry_dump" as ("path" integer[], "geom" geometry);

-- create type "gis"."valid_detail" as ("valid" boolean, "reason" character varying, "location" geometry);


