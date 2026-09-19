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
-- WHERE table_name = 'hospitals' AND column_name = 'is_verified';