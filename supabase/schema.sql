-- ====================================================================
-- LifeLink - Hyper-local Emergency Donor Network
-- Supabase Database Schema for User Registration & Login
-- ====================================================================

-- 1. Create custom ENUM types for data integrity
CREATE TYPE public.blood_group_enum AS ENUM (
  'A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'
);

CREATE TYPE public.user_role_enum AS ENUM (
  'donor', 'patient', 'hospital'
);

-- 2. Create the public.profiles table
-- This table automatically links to Supabase's built-in auth.users table
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone_number VARCHAR(15),
  blood_group blood_group_enum,
  role user_role_enum DEFAULT 'donor'::user_role_enum,
  is_available_to_donate BOOLEAN DEFAULT true,
  last_donation_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Indexes for fast hyper-local donor matching
CREATE INDEX idx_profiles_blood_group_available 
  ON public.profiles(blood_group, is_available_to_donate);

CREATE INDEX idx_profiles_role 
  ON public.profiles(role);

-- 4. Automatic Profile Creation Trigger
-- Automatically inserts a row into public.profiles whenever a user signs up via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, phone_number, blood_group, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Anonymous Donor'),
    NEW.email,
    NEW.raw_user_meta_data->>'phone_number',
    (NEW.raw_user_meta_data->>'blood_group')::public.blood_group_enum,
    COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role_enum, 'donor'::public.user_role_enum)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger execution after auth.users insert
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Row Level Security (RLS) Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read donor profiles (essential for emergency blood request matching)
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

-- Allow authenticated users to update only their own profile
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
