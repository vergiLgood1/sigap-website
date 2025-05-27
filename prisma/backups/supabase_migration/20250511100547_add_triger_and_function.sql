
-- Function to calculate distance from location to its district's assigned police unit
CREATE OR REPLACE FUNCTION gis.calculate_distance_to_district_unit() 
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Create trigger to automatically calculate distance when a location is inserted or updated
CREATE TRIGGER location_distance_to_unit_trigger
BEFORE INSERT OR UPDATE ON locations
FOR EACH ROW
EXECUTE FUNCTION gis.calculate_distance_to_district_unit();

-- Comment explaining what this migration does
COMMENT ON FUNCTION gis.calculate_distance_to_district_unit() IS 'Calculates the distance from a location to its district''s assigned police unit and populates the distance_to_unit field';
COMMENT ON TRIGGER location_distance_to_unit_trigger ON locations IS 'Automatically calculates distance to district''s assigned police unit when a location is inserted or updated';

-- Function to automatically create resource entries when new tables are created
-- and then create CRUD permissions for all admin users
-- Modified to work without event triggers
CREATE OR REPLACE FUNCTION gis.create_resource_and_permissions_for_table(table_name text)
RETURNS void AS $$
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
$$ LANGUAGE plpgsql;

-- Function to backfill resources and permissions for existing tables
CREATE OR REPLACE FUNCTION gis.backfill_resources_and_permissions()
RETURNS void AS $$
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
$$ LANGUAGE plpgsql;

-- Comments explaining the functions
COMMENT ON FUNCTION gis.create_resource_and_permissions_for_table(text) IS 'Creates resource entry and admin CRUD permissions for the specified table';
COMMENT ON FUNCTION gis.backfill_resources_and_permissions() IS 'Function to backfill resources and permissions for existing tables';
