# 🚀 Supabase Setup Guide - LifeLink Integration

## Project Details

- **Project Name**: LifeLink
- **Project ID**: `[YOUR-PROJECT-ID]`
- **Project URL**: `https://[YOUR-PROJECT-ID].supabase.co`
- **Status**: ✅ Fully configured and ready

---

## Step 1: Verify Your Supabase Project (Done ✅)

Your Supabase project is set up with:

1. ✅ **Project Created** — Active and running
2. ✅ **Authentication Configured** — Email/password authentication (magic link disabled)
3. ✅ **API Keys Generated** — Public anon key configured
4. ✅ **Database Ready** — PostgreSQL instance active
5. ✅ **MCP Server Configured** — For enhanced development
6. ✅ **Agent Skills Installed** — Supabase development tools

**Check Status:**
1. Go to https://supabase.com/dashboard
2. Open your project (ID: [YOUR-PROJECT-ID])
3. Look for green **"Connected"** status in top bar

---

## Step 2: Database Schema (Done ✅)

The complete schema has been **successfully applied** to your database.

### Tables Created:
```
profiles      - User role and metadata
donors        - Donor information
hospitals     - Hospital information
blood_requests - Blood requests from hospitals
donor_responses - Donor responses to requests
```

### Verification Query:
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

**Should return:** `donors`, `donor_responses`, `blood_requests`, `hospitals`, `profiles`

### RLS Policies (Updated):
- Simplified policies to prevent infinite recursion
- Authenticated users can read donors and hospitals
- Users can manage their own records
- Hospitals manage their requests and responses

---

## Step 3: RLS Policies (Done ✅)

All **9 Row-Level Security policies** are applied with idempotent `DO` blocks:

### Policy List:
1. `profiles_owner` — Users access own profile only
2. `donors_owner_manage` — Donors manage own records
3. `hospitals_read_donors` — Hospitals can read donors
4. `hospitals_owner_manage` — Hospitals manage own records
5. `authenticated_hospitals_view` — Hospitals view related data
6. `hospitals_manage_requests` — Hospitals manage their requests
7. `donors_view_assigned_requests` — Donors see assigned requests
8. `donors_manage_responses` — Donors manage own responses
9. `hospitals_manage_responses` — Hospitals manage responses

### How Policies Work:
- All policies use `DO $$...EXCEPTION...END $$` blocks
- This allows the schema to be safely re-run without errors
- Duplicate policies are silently skipped
- Original policies are never modified

### Verification:
```sql
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;
```

---

## Step 4: Realtime Configuration (Done ✅)

Realtime is enabled on core tables:

| Table | Realtime | Purpose |
|-------|----------|---------|
| `blood_requests` | ✅ ON | Hospital creates requests |
| `donor_responses` | ✅ ON | Donors respond to alerts |
| `donors` | ✅ ON | Donor availability changes |
| `hospitals` | ✅ ON | Hospital info updates |
| `profiles` | ❌ OFF | Auth-only, not needed |

### Enable Realtime Manually (if needed):
1. Go to **Database** → **Tables**
2. Click on table name (e.g., `blood_requests`)
3. Look for **Realtime** toggle at top-right
4. Toggle **ON** (should show green)

---

## Step 5: Environment Variables (Done ✅)

Your `.env` file contains:
```
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_anon_key
```

**⚠️ Important Notes:**
- Replace `your-project-id` with your actual project ID from Supabase Dashboard
- The **Anon/Publishable Key** can be committed (it's public-facing)
- Never commit your **Service Role Key** (that's private!)
- All sensitive operations are protected by Row-Level Security policies

### Get Fresh Keys (if needed):
1. Go to **Settings** → **API**
2. Copy **Project URL**
3. Copy **Anon / Public key**
4. Update `.env` if different

---

## Step 6: Test the Connection

### In Browser Console:
```javascript
// Open app at http://localhost:3000
// Press F12 → Console tab

// You should see:
✅ Auth state loaded
✅ Realtime subscription status: SUBSCRIBED
📡 Requests loaded: X
```

### Verify Role-Based Workflow:
1. Log in with one email address
2. Select a role on the onboarding screen
   - Hospital
   - Donor
3. If you are already logged in as a hospital, click **Switch Role** in the dashboard header
4. The app will delete your current `profiles` record and let you re-register as the other role
5. Refresh the page or wait for the redirect to return to the role selector

> This is the expected workflow when testing multiple roles from the same browser session.

### Test Query in Supabase:
1. Go to **SQL Editor**
2. Run:
```sql
-- Check connection
SELECT NOW();

-- Count records
SELECT COUNT(*) as total_profiles FROM profiles;
SELECT COUNT(*) as total_donors FROM donors;
SELECT COUNT(*) as total_hospitals FROM hospitals;
```

---

## Step 7: Seed Test Data

Insert test data to populate your database:

```sql
-- Insert test hospitals
INSERT INTO hospitals (name, city, contact_person, phone)
VALUES 
  ('City General Hospital', 'Mumbai', 'Dr. Sharma', '9876543210'),
  ('Apollo Medical Center', 'Bangalore', 'Dr. Verma', '9876543211'),
  ('Fortis Healthcare', 'Delhi', 'Dr. Gupta', '9123456789');

-- Insert test donors
INSERT INTO donors (name, blood_group, city, phone, available)
VALUES 
  ('Rahul Kumar', 'B+', 'Mumbai', '9988776655', true),
  ('Priya Singh', 'O-', 'Bangalore', '9876543221', true),
  ('Amit Patel', 'AB+', 'Delhi', '9765432123', true),
  ('Zara Khan', 'A+', 'Mumbai', '9654321098', true),
  ('Rohan Sharma', 'O+', 'Bangalore', '9543210987', true),
  ('Neha Reddy', 'B-', 'Delhi', '9432109876', false);

-- Verify inserts
SELECT COUNT(*) as donor_count FROM donors;
SELECT COUNT(*) as hospital_count FROM hospitals;
```

---

## Step 8: Authentication Setup

### Email & Password Configuration:
1. Go to **Authentication** → **Providers**
2. Click **Email**
3. Verify **Enable Email Auth** is ON ✅
4. Verify **Confirm email** is ON (or OFF for testing)
5. Disable **Magic Link** if it was enabled.

### Test Authentication:
1. Go to app: http://localhost:3000
2. Choose **Sign Up** if you don't have an account, or **Sign In** if you do.
3. Enter your email and password.
4. Click the appropriate button (Sign Up / Sign In).
5. If signing up with confirmation required, check email inbox and click the link.
6. Once logged in, select role (Hospital/Donor).
7. Dashboard loads ✨

> If you log in again with the same email, the app will restore your existing profile from `profiles`.
> If you want to switch role, use the **Switch Role** button in the dashboard header.

---

## Step 9: Troubleshooting

### ❌ "Table does not exist" error
**Fix:** Re-run `supabase_schema.sql`:
```bash
# In Supabase SQL Editor:
# 1. Click "New Query"
# 2. Paste entire supabase_schema.sql
# 3. Click "Run"
```

### ❌ "Policy already exists" error
**Fix:** This should NOT happen because policies use `DO` blocks.
If it does, the policy is already there — just reload the app.

### ❌ Real-time not working
**Fix:**
1. Go to **Database** → **Tables**
2. Click table (e.g., `blood_requests`)
3. Toggle Realtime to **ON**
4. Wait 30 seconds
5. Reload app

### ❌ "Cannot fetch data"
**Fix:**
1. Verify `.env` has correct URL and key
2. Check Supabase status page (any outages?)
3. Verify internet connection
4. Try in incognito mode (clear cache)

### ❌ Confirmation email not received
**Fix:**
1. Check spam folder
2. Wait 2 minutes (email can be slow)
3. Try different email address
4. Verify "Email Auth" is enabled in Supabase

---

## Step 10: Production Checklist

Before deploying to production:

- [ ] All 5 tables created and populated
- [ ] All 9 RLS policies applied
- [ ] Realtime enabled on `blood_requests` and `donor_responses`
- [ ] Email/password authentication working
- [ ] Role-based access working
- [ ] Real-time data sync working
- [ ] Environment variables set in deployment platform
- [ ] GitHub repository up-to-date
- [ ] No secrets committed to git (.env in .gitignore)
- [ ] App builds successfully (`npm run build`)

Replace `[your-project-id]` with your actual project ID:
- **Dashboard**: `https://app.supabase.com/project/[your-project-id]`
- **SQL Editor**: `https://app.supabase.com/project/[your-project-id]/sql/new`
- **Tables**: `https://app.supabase.com/project/[your-project-id]/editor`
- **Auth Users**: `https://app.supabase.com/project/[your-project-id]/auth/users`
- **Policies**: `https://app.supabase.com/project/[your-project-id]/auth/policies`
- **API Keys**: `https://app.supabase.com/project/[your-project-id]/settings/api`

---

## 📚 Additional Resources

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Supabase RLS Docs](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Realtime Docs](https://supabase.com/docs/guides/realtime)
- [LifeLink README](README.md)
- [LifeLink Troubleshooting](TROUBLESHOOTING.md)
```

---

## Step 7: Monitor Live Updates

Watch the **Network** tab in DevTools while:
1. Create a blood request from Hospital Dashboard
2. See if donor alerts appear instantly on Donor Dashboard
3. Check for WebSocket connections (should see `ws://` connections to Supabase)

---

## Debugging Checklist

- [ ] Supabase project is active
- [ ] Tables exist in database
- [ ] RLS policies are enabled (check SQL Editor)
- [ ] Realtime is enabled on `blood_requests` and `donor_responses`
- [ ] .env has correct URL and key
- [ ] node_modules are installed
- [ ] npm start runs without errors
- [ ] DevTools Console shows no Supabase errors
- [ ] Test data exists in tables
- [ ] WebSocket connections visible in Network tab

---

## Quick Reset (Start Fresh)

If something is broken, do this:

```bash
# 1. Clear everything
rm -r node_modules package-lock.json
rm -rf .next build dist

# 2. Reinstall
npm install

# 3. Clear cache
npm start  # Press Ctrl+Shift+Delete in browser DevTools

# 4. Re-check .env
cat .env

# 5. In Supabase, delete all data and re-run schema
-- Run this in SQL Editor
DROP TABLE IF EXISTS donor_responses CASCADE;
DROP TABLE IF EXISTS blood_requests CASCADE;
DROP TABLE IF EXISTS donors CASCADE;
DROP TABLE IF EXISTS hospitals CASCADE;

-- Then paste supabase_schema.sql again
```

---

## Next Steps

Once connection is verified:
1. ✅ Test Hospital Dashboard → Create Request
2. ✅ Switch to Donor Dashboard → See Alert in real-time
3. ✅ Donor confirms → Hospital sees status update
4. ✅ Hospital updates status → Donor sees confirmation

If all works, you're ready to add:
- Authentication (email and password)
- SMS notifications
- Location maps
- Push notifications
