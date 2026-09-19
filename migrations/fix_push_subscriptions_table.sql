-- Complete schema fix - run this in Supabase SQL Editor
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
ORDER BY table_name;