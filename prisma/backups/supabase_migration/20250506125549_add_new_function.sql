-- Restore function: public.generate_username
CREATE OR REPLACE FUNCTION public.generate_username(email text)
RETURNS text
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  result_username TEXT;
  username_base TEXT;
  random_number INTEGER;
  username_exists BOOLEAN;
BEGIN
  username_base := split_part(email, '@', 1);
  username_base := regexp_replace(username_base, '[^a-zA-Z0-9]', '_', 'g');
  random_number := floor(random() * 9900 + 100)::integer;
  result_username := username_base || random_number;
  LOOP
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE username = result_username) INTO username_exists;
    IF NOT username_exists THEN
      EXIT;
    END IF;
    random_number := floor(random() * 9900 + 100)::integer;
    result_username := username_base || random_number;
  END LOOP;
  RETURN result_username;
END;
$$;

-- Restore function: gis.update_land_area
CREATE OR REPLACE FUNCTION gis.update_land_area()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.land_area := ROUND((ST_Area(NEW.geometry::geography) / 1000000.0)::numeric, 2);
  RETURN NEW;
END;
$$;

-- Restore function: public.update_land_area
CREATE OR REPLACE FUNCTION public.update_land_area()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.land_area := ROUND(ST_Area(NEW.geometry::gis.geography) / 1000000.0);
  RETURN NEW;
END;
$$;

-- Restore function: public.update_timestamp
CREATE OR REPLACE FUNCTION public.update_timestamp()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

-- Restore function: public.handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
    role_id UUID;
BEGIN
    SELECT id INTO role_id FROM public.roles WHERE name = 'viewer' LIMIT 1;
    IF role_id IS NULL THEN
        RAISE EXCEPTION 'Role not found';
    END IF;
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

-- Restore function: public.handle_user_delete
CREATE OR REPLACE FUNCTION public.handle_user_delete()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.profiles WHERE user_id = OLD.id;
  DELETE FROM public.users WHERE id = OLD.id;
  RETURN OLD;
END;
$$;

-- Restore function: public.handle_user_update
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
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
  INSERT INTO public.profiles (id, user_id)
  SELECT gen_random_uuid(), NEW.id
  WHERE NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE user_id = NEW.id
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Function: public.handle_new_user()
-- Already exists in schema, so just create trigger

CREATE TRIGGER "on_auth_user_created"
AFTER INSERT ON "auth"."users"
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- Function: public.handle_user_delete()
-- Already exists in schema, so just create trigger

CREATE TRIGGER "on_auth_user_deleted"
AFTER DELETE ON "auth"."users"
FOR EACH ROW
EXECUTE FUNCTION public.handle_user_delete();

-- Function: public.handle_user_update()
-- Already exists in schema, so just create trigger

CREATE TRIGGER "on_auth_user_updated"
AFTER UPDATE ON "auth"."users"
FOR EACH ROW
EXECUTE FUNCTION public.handle_user_update();