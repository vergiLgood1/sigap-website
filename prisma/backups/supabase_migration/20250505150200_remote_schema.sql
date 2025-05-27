grant delete on table "storage"."s3_multipart_uploads" to "postgres";

grant insert on table "storage"."s3_multipart_uploads" to "postgres";

grant references on table "storage"."s3_multipart_uploads" to "postgres";

grant select on table "storage"."s3_multipart_uploads" to "postgres";

grant trigger on table "storage"."s3_multipart_uploads" to "postgres";

grant truncate on table "storage"."s3_multipart_uploads" to "postgres";

grant update on table "storage"."s3_multipart_uploads" to "postgres";

grant delete on table "storage"."s3_multipart_uploads_parts" to "postgres";

grant insert on table "storage"."s3_multipart_uploads_parts" to "postgres";

grant references on table "storage"."s3_multipart_uploads_parts" to "postgres";

grant select on table "storage"."s3_multipart_uploads_parts" to "postgres";

grant trigger on table "storage"."s3_multipart_uploads_parts" to "postgres";

grant truncate on table "storage"."s3_multipart_uploads_parts" to "postgres";

grant update on table "storage"."s3_multipart_uploads_parts" to "postgres";


-- drop type "gis"."geometry_dump";

-- drop type "gis"."valid_detail";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION gis.calculate_unit_incident_distances(p_unit_id character varying, p_district_id character varying DEFAULT NULL::character varying)
 RETURNS TABLE(unit_code character varying, unit_name character varying, unit_lat double precision, unit_lng double precision, incident_id character varying, incident_description text, incident_lat double precision, incident_lng double precision, category_name character varying, district_name character varying, distance_meters double precision)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  WITH unit_locations AS (
    SELECT
       u.code_unit,
      u.name,
      u.latitude,
      u.longitude,
      u.district_id,
      ST_SetSRID(ST_MakePoint(u.longitude, u.latitude), 4326)::geography AS location
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
      ci.description,
      ci.crime_id,
      ci.crime_category_id,
      l.latitude,
      l.longitude,
      ST_SetSRID(ST_MakePoint(l.longitude, l.latitude), 4326)::geography AS location
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
    ul.name as unit_name,
    ul.latitude as unit_lat,
    ul.longitude as unit_lng,
    il.id as incident_id,
    il.description as incident_description,
    il.latitude as incident_lat,
    il.longitude as incident_lng,
    cc.name as category_name,
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
  JOIN
    crime_categories cc ON il.crime_category_id = cc.id
  ORDER BY
    ul.code_unit,
    ul.location <-> il.location; -- Use KNN operator for efficient ordering
END;
$function$
;

CREATE OR REPLACE FUNCTION gis.find_nearest_unit_to_incident(p_incident_id integer)
 RETURNS TABLE(unit_code text, unit_name text, distance_meters double precision)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION gis.find_units_within_distance(p_incident_id integer, p_max_distance_meters double precision DEFAULT 5000)
 RETURNS TABLE(unit_code text, unit_name text, distance_meters double precision)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

-- create type "gis"."geometry_dump" as ("path" integer[], "geom" geometry);

-- create type "gis"."valid_detail" as ("valid" boolean, "reason" character varying, "location" geometry);


