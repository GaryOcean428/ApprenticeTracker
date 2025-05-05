-- Initial admin user setup
DO $$
DECLARE
  user_id uuid;
BEGIN
  -- Create admin user if not exists
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'braden.lang77@gmail.com',
    crypt('admin123', gen_salt('bf')),
    now(),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"name": "Braden Lang", "role": "admin"}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  )
  ON CONFLICT DO NOTHING
  RETURNING id INTO user_id;

  -- If user already exists, get their ID
  IF user_id IS NULL THEN
    SELECT id INTO user_id
    FROM auth.users
    WHERE email = 'braden.lang77@gmail.com';
  END IF;

  -- Set up admin profile
  INSERT INTO public.profiles (id, email, role, can_manage_schema)
  VALUES (
    user_id,
    'braden.lang77@gmail.com',
    'admin',
    true
  )
  ON CONFLICT (id) DO UPDATE
  SET role = 'admin',
      can_manage_schema = true;
END $$;
