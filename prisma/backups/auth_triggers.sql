-- Updated function to handle conditional user creation based on metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
AS $$
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
$$;

-- Create or replace trigger for user creation
DROP TRIGGER IF EXISTS "on_auth_user_created" ON "auth"."users";
CREATE TRIGGER "on_auth_user_created"
AFTER INSERT ON "auth"."users"
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- Updated function to handle conditional user update based on metadata
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
AS $$
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
$$;

-- Create or replace trigger for user updates
DROP TRIGGER IF EXISTS "on_auth_user_updated" ON "auth"."users";
CREATE TRIGGER "on_auth_user_updated"
AFTER UPDATE ON "auth"."users"
FOR EACH ROW
WHEN (OLD.* IS DISTINCT FROM NEW.*)
EXECUTE FUNCTION public.handle_user_update();

-- Updated function to handle conditional user deletion based on role
CREATE OR REPLACE FUNCTION public.handle_user_delete()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
AS $$
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
$$;

-- Create or replace trigger for user deletion
DROP TRIGGER IF EXISTS "on_auth_user_deleted" ON "auth"."users";
CREATE TRIGGER "on_auth_user_deleted"
AFTER DELETE ON "auth"."users"
FOR EACH ROW
EXECUTE FUNCTION public.handle_user_delete();

-- Function to handle when a user is converted to/from an officer
CREATE OR REPLACE FUNCTION public.handle_user_type_change()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
AS $$
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
$$;

-- Create or replace trigger for user type changes
DROP TRIGGER IF EXISTS "on_auth_user_type_change" ON "auth"."users";
CREATE TRIGGER "on_auth_user_type_change"
AFTER UPDATE ON "auth"."users"
FOR EACH ROW
WHEN (
    (OLD.raw_user_meta_data->>'is_officer')::boolean IS DISTINCT FROM 
    (NEW.raw_user_meta_data->>'is_officer')::boolean
)
EXECUTE FUNCTION public.handle_user_type_change();

-- Add an informational message about trigger creation
DO $$
BEGIN
    RAISE NOTICE 'All authentication triggers have been created successfully';
END $$;