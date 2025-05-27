-- drop type "gis"."geometry_dump";

-- drop type "gis"."valid_detail";

set check_function_bodies = off;

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


