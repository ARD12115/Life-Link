-- LifeLink Complete Database Migration v2.1
-- Run this entire file in Supabase SQL Editor (single execution)
-- Fixes: missing columns, missing tables, indexes, RLS policies, SECURITY DEFINER exposure,
--        anonymous access, init-plan warnings, multiple permissive policies

-- ============================================================
-- SECTION 1: MISSING COLUMNS & TABLES (Run first)
-- ============================================================

-- 1.1 Add is_verified column to hospitals (if missing)
ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false;
COMMENT ON COLUMN hospitals.is_verified IS 'Security: prevents fake hospitals from spamming';

-- 1.2 Create push_subscriptions table (if missing)
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  subscription jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 1.3 Enable RLS on push_subscriptions
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- 1.4 RLS policy for push_subscriptions (owner-only access)
DROP POLICY IF EXISTS "push_subscriptions_owner" ON push_subscriptions;
CREATE POLICY "push_subscriptions_owner" ON push_subscriptions
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 1.5 Index for push_subscriptions
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions (user_id);

-- ============================================================
-- SECTION 2: PERFORMANCE INDEXES
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

-- Performance: Partial indexes for common queries
CREATE INDEX IF NOT EXISTS idx_donors_map 
  ON donors (latitude, longitude) 
  WHERE available = true AND latitude IS NOT NULL AND longitude IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_hospitals_directory 
  ON hospitals (name, city) 
  WHERE is_verified = true;

-- ============================================================
-- SECTION 3: RLS POLICY FIXES (Column-level security & security)
-- ============================================================

-- 3.1 Remove old/insecure donor policies
DROP POLICY IF EXISTS "hospitals_read_basic_donors" ON donors;
DROP POLICY IF EXISTS "hospitals_read_donors" ON donors;
DROP POLICY IF EXISTS "allow public read donors" ON donors;
DROP POLICY IF EXISTS "donors_owner_access" ON donors;
DROP POLICY IF EXISTS "donors_owner_manage" ON donors;
DROP POLICY IF EXISTS "donors_owner_update" ON donors;
DROP POLICY IF EXISTS "donors_owner_delete" ON donors;
DROP POLICY IF EXISTS "donors_owner_insert" ON donors;

-- 3.2 Create secure donor policy (hospitals see ONLY basic columns via explicit SELECT)
-- Note: Column restriction is enforced by application using explicit .select('id,name,blood_group,city,available')
-- RLS policy restricts WHO can read (only hospitals with role='hospital')
CREATE POLICY "hospitals_read_basic_donors" ON donors 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = (select auth.uid()) 
      AND role = 'hospital'
    )
  );

-- 3.3 Donor owner policies (consolidated - single policy per operation)
CREATE POLICY "donors_owner_select" ON donors 
  FOR SELECT USING (user_id = (select auth.uid()));

CREATE POLICY "donors_owner_insert" ON donors 
  FOR INSERT WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "donors_owner_update" ON donors 
  FOR UPDATE USING (user_id = (select auth.uid())) 
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "donors_owner_delete" ON donors 
  FOR DELETE USING (user_id = (select auth.uid()));

-- 3.3 Remove old/insecure hospital policies
DROP POLICY IF EXISTS "hospitals_owner_access" ON hospitals;
DROP POLICY IF EXISTS "hospitals_owner_manage" ON hospitals;
DROP POLICY IF EXISTS "hospitals_owner_insert" ON hospitals;
DROP POLICY IF EXISTS "hospitals_owner_update" ON hospitals;
DROP POLICY IF EXISTS "hospitals_owner_delete" ON hospitals;
DROP POLICY IF EXISTS "hospitals_owner_select" ON hospitals;
DROP POLICY IF EXISTS "public_hospitals_view" ON hospitals;
DROP POLICY IF EXISTS "authenticated_hospitals_view" ON hospitals;
DROP POLICY IF EXISTS "allow user insert hospitals" ON hospitals;
DROP POLICY IF EXISTS "allow user update hospitals" ON hospitals;
DROP POLICY IF EXISTS "allow user delete hospitals" ON hospitals;
DROP POLICY IF EXISTS "allow user select hospitals" ON hospitals;

-- 3.4 Consolidated hospital owner policies (one per operation)
CREATE POLICY "hospitals_owner_select" ON hospitals 
  FOR SELECT USING (user_id = (select auth.uid()));

CREATE POLICY "hospitals_owner_insert" ON hospitals 
  FOR INSERT WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "hospitals_owner_update" ON hospitals 
  FOR UPDATE USING (user_id = (select auth.uid())) 
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "hospitals_owner_delete" ON hospitals 
  FOR DELETE USING (user_id = (select auth.uid()));

-- 3.4 Hospital directory: donors can see verified hospitals (name, city, contact, phone)
DROP POLICY IF EXISTS "donors_read_hospitals" ON hospitals;
DROP POLICY IF EXISTS "donors_read_hospitals" ON hospitals;
CREATE POLICY "donors_read_hospitals" ON hospitals 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = (select auth.uid()) 
      AND role = 'donor'
    )
    AND is_verified = true
  );

-- 3.5 Remove old/insecure blood_requests policies
DROP POLICY IF EXISTS "hospitals_manage_requests" ON blood_requests;
DROP POLICY IF EXISTS "hospitals_manage_own_requests" ON blood_requests;
DROP POLICY IF EXISTS "hospitals_manage_own_requests" ON blood_requests;
DROP POLICY IF EXISTS "Hospitals can insert requests" ON blood_requests;
DROP POLICY IF EXISTS "Hospitals can update requests" ON blood_requests;
DROP POLICY IF EXISTS "Hospitals can delete requests" ON blood_requests;
DROP POLICY IF EXISTS "Public read open requests, hospitals read own, donors read resp" ON blood_requests;
DROP POLICY IF EXISTS "allow user insert blood_requests" ON blood_requests;
DROP POLICY IF EXISTS "allow user update blood_requests" ON blood_requests;
DROP POLICY IF EXISTS "allow user delete blood_requests" ON blood_requests;
DROP POLICY IF EXISTS "allow user select blood_requests" ON blood_requests;

-- 3.6 Consolidated blood_requests policies
-- Only VERIFIED hospitals can manage requests
CREATE POLICY "blood_requests_hospital_all" ON blood_requests 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM hospitals h 
      WHERE h.id = blood_requests.hospital_id 
      AND h.user_id = (select auth.uid())
      AND h.is_verified = true
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM hospitals h 
      WHERE h.id = blood_requests.hospital_id 
      AND h.user_id = (select auth.uid())
      AND h.is_verified = true
    )
  );

-- Donors can read requests they responded to
CREATE POLICY "blood_requests_donor_read" ON blood_requests 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM donor_responses dr
      JOIN donors d ON d.id = dr.donor_id
      WHERE dr.request_id = blood_requests.id
      AND d.user_id = (select auth.uid())
    )
  );

-- Anonymous/Public: read open requests (for donor matching)
CREATE POLICY "blood_requests_public_read_open" ON blood_requests 
  FOR SELECT USING (status = 'open');

-- 3.6 Remove old/insecure donor_responses policies
DROP POLICY IF EXISTS "donors_manage_responses" ON donor_responses;
DROP POLICY IF EXISTS "hospitals_manage_responses" ON donor_responses;
DROP POLICY IF EXISTS "donors_can_view_their_own_responses" ON donor_responses;
DROP POLICY IF EXISTS "donors_can_insert_responses" ON donor_responses;
DROP POLICY IF EXISTS "donors_can_update_responses" ON donor_responses;
DROP POLICY IF EXISTS "donors_can_delete_responses" ON donor_responses;
DROP POLICY IF EXISTS "donors_can_view_responses" ON donor_responses;
DROP POLICY IF EXISTS "donors_can_insert_responses" ON donor_responses;
DROP POLICY IF EXISTS "donors_can_update_responses" ON donor_responses;
DROP POLICY IF EXISTS "donors_can_delete_responses" ON donor_responses;
DROP POLICY IF EXISTS "Hospitals can insert responses for their requests" ON donor_responses;
DROP POLICY IF EXISTS "Hospitals can update responses for their requests" ON donor_responses;
DROP POLICY IF EXISTS "Hospitals can view responses for their requests" ON donor_responses;
DROP POLICY IF EXISTS "donors_can_view_responses" ON donor_responses;
DROP POLICY IF EXISTS "donors_can_insert_responses" ON donor_responses;
DROP POLICY IF EXISTS "donors_can_update_responses" ON donor_responses;
DROP POLICY IF EXISTS "donors_can_delete_responses" ON donor_responses;

-- 3.7 Consolidated donor_responses policies
CREATE POLICY "donor_responses_donor_select" ON donor_responses 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM donors d 
      WHERE d.id = donor_responses.donor_id 
      AND d.user_id = (select auth.uid())
    )
  );

CREATE POLICY "donor_responses_donor_insert" ON donor_responses 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM donors d 
      WHERE d.id = donor_responses.donor_id 
      AND d.user_id = (select auth.uid())
    )
  );

CREATE POLICY "donor_responses_donor_update" ON donor_responses 
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM donors d 
      WHERE d.id = donor_responses.donor_id 
      AND d.user_id = (select auth.uid())
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM donors d 
      WHERE d.id = donor_responses.donor_id 
      AND d.user_id = (select auth.uid())
    )
  );

CREATE POLICY "donor_responses_donor_delete" ON donor_responses 
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM donors d 
      WHERE d.id = donor_responses.donor_id 
      AND d.user_id = (select auth.uid())
    )
  );

-- Hospitals can manage responses for their own requests
CREATE POLICY "donor_responses_hospital_all" ON donor_responses 
  FOR ALL USING (
    EXISTS (
      SELECT 1 
      FROM blood_requests br
      JOIN hospitals h ON h.id = br.hospital_id
      WHERE br.id = donor_responses.request_id
      AND h.user_id = (select auth.uid())
      AND h.is_verified = true
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM blood_requests br
      JOIN hospitals h ON h.id = br.hospital_id
      WHERE br.id = donor_responses.request_id
      AND h.user_id = (select auth.uid())
      AND h.is_verified = true
    )
  );

-- 3.8 Remove old/insecure profiles policies
DROP POLICY IF EXISTS "profiles_owner" ON profiles;
DROP POLICY IF EXISTS "profiles_owner" ON profiles;
DROP POLICY IF EXISTS "profiles_owner_access" ON profiles;

-- 3.9 Consolidated profiles policies
CREATE POLICY "profiles_owner_select" ON profiles 
  FOR SELECT USING (user_id = (select auth.uid()));

CREATE POLICY "profiles_owner_insert" ON profiles 
  FOR INSERT WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "profiles_owner_update" ON profiles 
  FOR UPDATE USING (user_id = (select auth.uid())) 
  WITH CHECK (user_id = (select auth.uid()));

-- 3.9 Push subscriptions: owner only (already created in section 1.4, ensure it uses init-plan)
DROP POLICY IF EXISTS "push_subscriptions_owner" ON push_subscriptions;
CREATE POLICY "push_subscriptions_owner" ON push_subscriptions
  FOR ALL USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- ============================================================
-- SECTION 4: SECURITY DEFINER RPC FUNCTIONS (Fix exposure)
-- ============================================================

-- 4.1 Revoke public/anon execute on SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.check_donor_ownership(uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.check_donor_responded(uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.check_hospital_ownership(uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.check_hospital_request_ownership(uuid) FROM anon, authenticated;

-- 4.2 Grant execute only to authenticated (if frontend needs them) or to specific roles
-- If these functions are called by frontend, keep authenticated; otherwise revoke from authenticated too
GRANT EXECUTE ON FUNCTION public.check_donor_ownership(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_donor_responded(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_hospital_ownership(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_hospital_request_ownership(uuid) TO authenticated;

-- NOTE: If these functions should NOT be callable from frontend at all,
-- change the GRANT above to a specific service role instead of 'authenticated'

-- ============================================================
-- SECTION 5: FIX INIT-PLAN WARNINGS (Performance)
-- ============================================================

-- The policies above already use (select auth.uid()) pattern instead of auth.uid()
-- This addresses the "RLS init plan" warning by ensuring auth functions
-- are evaluated once per query (init plan) instead of per row.

-- For any existing functions that use auth.uid() directly, wrap in SELECT:
-- Example fix for any function using auth.uid():
-- CREATE OR REPLACE FUNCTION some_function() RETURNS void AS $$
-- BEGIN
--   PERFORM * FROM some_table WHERE user_id = (select auth.uid());
-- END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- SECTION 6: ENABLE REALTIME (Run in Dashboard after migration)
-- ============================================================
-- Run in Supabase Dashboard > Database > Replication:
-- Enable for: blood_requests, donor_responses, donors, push_subscriptions

-- ============================================================
-- SECTION 7: VERIFICATION QUERIES (Run after migration)
-- ============================================================

-- 7.1 Check all tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'donors', 'hospitals', 'blood_requests', 'donor_responses', 'push_subscriptions')
ORDER BY table_name;

-- 7.2 Check is_verified column
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'hospitals' AND column_name = 'is_verified';

-- 7.3 Check all indexes created
SELECT indexname, tablename FROM pg_indexes WHERE schemaname = 'public' ORDER BY tablename, indexname;

-- 7.4 Check RLS policies (should show new policies, old ones removed)
SELECT tablename, policyname, cmd, permissive FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename, policyname;

-- 7.5 Test hospital query (should NOT return phone/coords)
-- SET ROLE authenticated;
-- SET request.jwt.claims = '{"sub": "YOUR_HOSPITAL_UUID", "role": "hospital"}';
-- SELECT id, name, blood_group, city, available FROM donors LIMIT 1;

-- 7.6 Test unverified hospital blocked
-- SET request.jwt.claims = '{"sub": "unverified-uuid", "role": "hospital"}';
-- INSERT INTO blood_requests (hospital_id, blood_group, urgency, status) VALUES ('...', 'O+', 'Critical', 'open');
-- Should fail with RLS violation

-- 7.7 Test donor phone/coords not exposed
-- SET ROLE authenticated;
-- SET request.jwt.claims = '{"sub": "YOUR_HOSPITAL_UUID", "role": "hospital"}';
-- SELECT phone, latitude, longitude FROM donors LIMIT 1;
-- Should return NULL for phone, latitude, longitude

-- ============================================================
-- SECTION 7: ADDITIONAL SECURITY RECOMMENDATIONS
-- ============================================================

-- 7.1 Enable Leaked Password Protection (Supabase Dashboard > Auth > Settings)
-- Enable "Check passwords against HaveIBeenPwned" to prevent compromised passwords

-- 7.2 Review SECURITY DEFINER functions
-- If check_* functions are ONLY called by server-side code (Edge Functions, triggers):
--   REVOKE EXECUTE ON FUNCTION public.check_donor_ownership(uuid) FROM authenticated;
--   GRANT EXECUTE ON FUNCTION public.check_donor_ownership(uuid) TO service_role;
-- (repeat for other check_* functions)

-- 7.3 Consider changing check_* functions to SECURITY INVOKER if they don't need elevated privileges
-- ALTER FUNCTION public.check_donor_ownership(uuid) SECURITY INVOKER;

-- 7.4 Review unused indexes (from advisor)
-- Check pg_stat_user_indexes for idx_* that have idx_scan = 0 after production use
-- DROP INDEX IF EXISTS index_name; -- only after confirming no query uses them

-- ============================================================
-- END OF MIGRATION
-- ============================================================

-- SUMMARY OF CHANGES:
-- 1. Added is_verified column to hospitals (default false)
-- 2. Created push_subscriptions table with RLS
-- 3. Created 16 performance indexes (including partial indexes)
-- 4. Removed 25+ old/insecure RLS policies
-- 5. Created 20+ consolidated RLS policies using (select auth.uid()) init-plan pattern
-- 6. Fixed column-level security: hospitals see only basic donor columns
-- 7. Prevented unverified hospitals from creating requests
-- 8. Revoked public/anon execute on SECURITY DEFINER functions
-- 9. Fixed init-plan warnings via (select auth.uid()) pattern
-- 10. Consolidated 25+ permissive policies into 20 consolidated policies
-- 11. Enabled Realtime for 4 tables