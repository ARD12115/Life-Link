-- Fix: Add missing is_verified column to hospitals table
-- Run this FIRST in Supabase SQL Editor before running migrations/database_migration_v2.1.sql

-- Add is_verified column if it doesn't exist
ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false;

-- Add comment for clarity
COMMENT ON COLUMN hospitals.is_verified IS 'Security: prevents fake hospitals from spamming';

-- Now the index from migration v2.1 will work:
-- CREATE INDEX IF NOT EXISTS idx_hospitals_verified ON hospitals (is_verified) WHERE is_verified = true;

-- Also ensure the RLS policy for verified hospitals works:
-- The policy in migration v2.1 checks: h.is_verified = true

-- Verify the column exists:
-- SELECT column_name, data_type, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'hospitals' AND column_name = 'is_verified';-- Complete schema fix - run this in Supabase SQL Editor
-- This creates ALL missing tables including push_subscriptions

-- 1. Add missing is_verified column (if missing)
ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false;

-- 2. Create push_subscriptions table (if missing)
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  subscription jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 3. Enable RLS on push_subscriptions
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policy for push_subscriptions
DROP POLICY IF EXISTS "push_subscriptions_owner" ON push_subscriptions;
CREATE POLICY "push_subscriptions_owner" ON push_subscriptions FOR ALL USING (
  auth.uid() = user_id
) WITH CHECK (
  auth.uid() = user_id
);

-- 5. Enable Realtime for push_subscriptions (run in Supabase Dashboard > Database > Replication)
-- ALTER PUBLICATION supabase_realtime ADD TABLE push_subscriptions;

-- 6. Create index for push_subscriptions
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions (user_id);

-- 7. Verify all tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'donors', 'hospitals', 'blood_requests', 'donor_responses', 'push_subscriptions')
ORDER BY table_name;-- LifeLink Database Migration v2.1 - RUN THIS IN SUPABASE SQL EDITOR
-- Run AFTER fix scripts (is_verified column + push_subscriptions table)

-- ============================================================
-- PERFORMANCE INDEXES
-- ============================================================

-- Donors: Common query patterns
CREATE INDEX IF NOT EXISTS idx_donors_blood_group_available 
  ON donors (blood_group, available) WHERE available = true;

CREATE INDEX IF NOT EXISTS idx_donors_city_available 
  ON donors (city, available) WHERE available = true;

CREATE INDEX IF NOT EXISTS idx_donors_user_id 
  ON donors (user_id);

-- Blood Requests: Most common filters
CREATE INDEX IF NOT EXISTS idx_blood_requests_status_created 
  ON blood_requests (status, created_at DESC) WHERE status = 'open';

CREATE INDEX IF NOT EXISTS idx_blood_requests_hospital_status 
  ON blood_requests (hospital_id, status);

CREATE INDEX IF NOT EXISTS idx_blood_requests_blood_group_status 
  ON blood_requests (blood_group, status) WHERE status = 'open';

-- Donor Responses: Join performance
CREATE INDEX IF NOT EXISTS idx_donor_responses_request_id 
  ON donor_responses (request_id);

CREATE INDEX IF NOT EXISTS idx_donor_responses_donor_id 
  ON donor_responses (donor_id);

CREATE INDEX IF NOT EXISTS idx_donor_responses_status 
  ON donor_responses (status);

-- Hospitals: Verification checks
CREATE INDEX IF NOT EXISTS idx_hospitals_user_id 
  ON hospitals (user_id);

CREATE INDEX IF NOT EXISTS idx_hospitals_verified 
  ON hospitals (is_verified) WHERE is_verified = true;

-- Profiles: Role lookups
CREATE INDEX IF NOT EXISTS idx_profiles_user_id 
  ON profiles (user_id);

-- Push Subscriptions: User lookups
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id 
  ON push_subscriptions (user_id);

-- ============================================================
-- RLS POLICY FIXES (Column-level security)
-- ============================================================

-- Recreate donor policies with explicit column restriction
DROP POLICY IF EXISTS "hospitals_read_basic_donors" ON donors;
DROP POLICY IF EXISTS "hospitals_read_donors" ON donors;
DROP POLICY IF EXISTS "allow public read donors" ON donors;

CREATE POLICY "hospitals_read_basic_donors" ON donors 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() 
      AND role = 'hospital'
    )
  );

-- ============================================================
-- ADDITIONAL SECURITY: Prevent unverified hospitals from creating requests
-- ============================================================

DROP POLICY IF EXISTS "hospitals_manage_requests" ON blood_requests;
DROP POLICY IF EXISTS "Hospitals can insert requests" ON blood_requests;
DROP POLICY IF EXISTS "Hospitals can update requests" ON blood_requests;
DROP POLICY IF EXISTS "Hospitals can delete requests" ON blood_requests;
DROP POLICY IF EXISTS "Public read open requests, hospitals read own, donors read resp" ON blood_requests;

CREATE POLICY "hospitals_manage_requests" ON blood_requests 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM hospitals h 
      WHERE h.id = blood_requests.hospital_id 
      AND h.user_id = auth.uid()
      AND h.is_verified = true
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM hospitals h 
      WHERE h.id = blood_requests.hospital_id 
      AND h.user_id = auth.uid()
      AND h.is_verified = true
    )
  );

-- ============================================================
-- PERFORMANCE: Partial indexes for common queries
-- ============================================================

-- For donor map: only available donors with coordinates
CREATE INDEX IF NOT EXISTS idx_donors_map 
  ON donors (latitude, longitude) 
  WHERE available = true AND latitude IS NOT NULL AND longitude IS NOT NULL;

-- For hospital directory: only verified hospitals
CREATE INDEX IF NOT EXISTS idx_hospitals_directory 
  ON hospitals (name, city) 
  WHERE is_verified = true;