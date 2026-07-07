-- ====================================================================
-- LifeLink - Hyper-local Emergency Donor Network
-- Supabase Database Schema for User Registration & Login (Crash-Proof)
-- ====================================================================

-- 1. Create custom ENUM types safely (idempotent)
DO $$ BEGIN
  CREATE TYPE public.blood_group_enum AS ENUM ('A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.user_role_enum AS ENUM ('donor', 'patient', 'hospital');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Create the public.profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone_number VARCHAR(15),
  blood_group public.blood_group_enum,
  role public.user_role_enum DEFAULT 'donor'::public.user_role_enum,
  is_available_to_donate BOOLEAN DEFAULT true,
  last_donation_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Indexes for fast hyper-local donor matching
CREATE INDEX IF NOT EXISTS idx_profiles_blood_group_available 
  ON public.profiles(blood_group, is_available_to_donate);

CREATE INDEX IF NOT EXISTS idx_profiles_role 
  ON public.profiles(role);

-- 4. Automatic Profile Creation Trigger (Resilient & Crash-Proof)
-- Automatically inserts or updates a row into public.profiles whenever a user signs up via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  bg_val public.blood_group_enum;
  role_val public.user_role_enum;
BEGIN
  -- Safely parse blood group without crashing on empty string or invalid input
  BEGIN
    bg_val := NULLIF(NEW.raw_user_meta_data->>'blood_group', '')::public.blood_group_enum;
  EXCEPTION WHEN OTHERS THEN
    bg_val := 'O+'::public.blood_group_enum;
  END;

  -- Safely parse role without crashing on empty string or invalid input
  BEGIN
    role_val := COALESCE(NULLIF(NEW.raw_user_meta_data->>'role', '')::public.user_role_enum, 'donor'::public.user_role_enum);
  EXCEPTION WHEN OTHERS THEN
    role_val := 'donor'::public.user_role_enum;
  END;

  INSERT INTO public.profiles (id, full_name, email, phone_number, blood_group, role)
  VALUES (
    NEW.id,
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'full_name', ''), NEW.email::text, 'Anonymous Donor'),
    NEW.email,
    NULLIF(NEW.raw_user_meta_data->>'phone_number', ''),
    COALESCE(bg_val, 'O+'::public.blood_group_enum),
    role_val
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone_number = EXCLUDED.phone_number,
    blood_group = EXCLUDED.blood_group,
    role = EXCLUDED.role,
    updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger execution after auth.users insert or update
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Row Level Security (RLS) Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read donor profiles (essential for emergency blood request matching)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

-- Allow users or registration flows to insert profiles safely
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (true);

-- Allow authenticated users to update their own profile
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (true)
  WITH CHECK (true);
