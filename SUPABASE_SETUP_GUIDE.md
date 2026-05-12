# Supabase Setup Guide

Step-by-step guide for configuring Supabase with the LifeLink project.

---

## 1. Create a Supabase Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **New Project**
3. Choose an organisation, set a name (e.g. `LifeLink`), and pick a region
4. Note your **Project ID** from the project URL

---

## 2. Get Your API Keys

1. Go to **Settings → API**
2. Copy the **Project URL** and **Anon / Public key**
3. Paste them into your `.env` file:

```dotenv
REACT_APP_SUPABASE_URL=https://<your-project-id>.supabase.co
REACT_APP_SUPABASE_PUBLISHABLE_KEY=<your-anon-key>
```

> The anon key is safe to use in client-side code. All data access is governed by Row-Level Security policies.

---

## 3. Apply the Database Schema

1. Go to **SQL Editor → New Query**
2. Paste the entire contents of [`supabase_schema.sql`](supabase_schema.sql)
3. Click **Run**

### Tables created

| Table | Purpose |
|-------|---------|
| `profiles` | User role and metadata |
| `donors` | Donor information |
| `hospitals` | Hospital information |
| `blood_requests` | Blood requests from hospitals |
| `donor_responses` | Donor responses to requests |

### Verify tables exist

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

Should return: `blood_requests`, `donor_responses`, `donors`, `hospitals`, `profiles`.

---

## 4. RLS Policies

The schema applies **9 Row-Level Security policies** using idempotent `DO` blocks (safe to re-run):

| Policy | Table | Effect |
|--------|-------|--------|
| `profiles_owner` | `profiles` | Users access only their own profile |
| `donors_owner_manage` | `donors` | Donors manage their own record |
| `hospitals_read_donors` | `donors` | Authenticated users can read donors |
| `hospitals_owner_manage` | `hospitals` | Hospitals manage their own record |
| `authenticated_hospitals_view` | `hospitals` | Authenticated users can view hospitals |
| `hospitals_manage_requests` | `blood_requests` | Hospitals manage their own requests |
| `donors_view_assigned_requests` | `blood_requests` | Donors see requests assigned to them |
| `donors_manage_responses` | `donor_responses` | Donors manage their own responses |
| `hospitals_manage_responses` | `donor_responses` | Hospitals manage responses for their requests |

### Verify policies

```sql
SELECT tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

---

## 5. Enable Realtime

Realtime should be enabled on the following tables:

| Table | Realtime | Why |
|-------|----------|-----|
| `blood_requests` | ✅ ON | Hospital creates requests → donors see them instantly |
| `donor_responses` | ✅ ON | Donors respond → hospitals see status changes |
| `donors` | ✅ ON | Donor availability changes propagate |
| `hospitals` | ✅ ON | Hospital info updates propagate |
| `profiles` | ❌ OFF | Auth-only data, no real-time need |

### Enable manually (if needed)

1. Go to **Database → Tables**
2. Click the table name
3. Toggle **Realtime** to **ON** at the top-right

---

## 6. Configure Authentication

1. Go to **Authentication → Providers → Email**
2. Ensure **Enable Email Auth** is ON
3. **Confirm email**: Set to ON for production, OFF for faster local testing
4. Magic Link should be **disabled** (LifeLink uses email/password only)

### Test authentication

1. Start the app: `npm start`
2. Navigate to [http://localhost:3000/hospital](http://localhost:3000/hospital)
3. Click **Register** to create an account, or **Sign In** if you already have one
4. If email confirmation is enabled, check your inbox and click the link
5. After signing in, the Hospital Dashboard loads

---

## 7. Seed Test Data (Optional)

Insert sample data to test the app:

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
  ('Rohan Sharma', 'O+', 'Bangalore', '9543210987', true);

-- Verify
SELECT COUNT(*) AS donor_count FROM donors;
SELECT COUNT(*) AS hospital_count FROM hospitals;
```

---

## 8. Verify Connection

### From the browser console

Open [http://localhost:3000](http://localhost:3000), press F12, and check the Console tab:

```text
✅ Supabase URL: https://<your-project-id>.supabase.co
✅ Key Loaded: YES
📡 Fetching blood requests...
👥 Fetching donors...
📡 Realtime subscription status: SUBSCRIBED
```

### From the Supabase SQL Editor

```sql
-- Check connection
SELECT NOW();

-- Count records
SELECT COUNT(*) AS total_profiles FROM profiles;
SELECT COUNT(*) AS total_donors FROM donors;
SELECT COUNT(*) AS total_hospitals FROM hospitals;
```

---

## 9. Monitor Real-time Updates

1. Open the app in **two browser tabs** side by side
2. Tab 1: Sign in as a Hospital → create a blood request
3. Tab 2: Navigate to `/donor` → register as a donor
4. Watch Tab 2 for the alert to appear instantly
5. In DevTools → Network tab, look for WebSocket connections (`ws://`) to Supabase

---

## 10. Production Checklist

Before deploying:

- [ ] All 5 tables created and populated
- [ ] All 9 RLS policies applied
- [ ] Realtime enabled on `blood_requests` and `donor_responses`
- [ ] Email/password authentication working
- [ ] Real-time data sync working
- [ ] Environment variables set in deployment platform (Vercel, Netlify, etc.)
- [ ] No secrets committed to git (`.env` is in `.gitignore`)
- [ ] `npm run build` succeeds

---

## Quick Reset

If something is broken and you need to start fresh:

```bash
# 1. Clear local environment
rm -r node_modules package-lock.json build
npm install

# 2. Reset .env
cp .env.example .env
# Fill in your Supabase keys

# 3. Start fresh
npm start
# In browser: Ctrl+Shift+Delete to clear cache
```

To reset the database:

```sql
-- Run in Supabase SQL Editor
DROP TABLE IF EXISTS donor_responses CASCADE;
DROP TABLE IF EXISTS blood_requests CASCADE;
DROP TABLE IF EXISTS donors CASCADE;
DROP TABLE IF EXISTS hospitals CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Then re-run supabase_schema.sql
```

---

## Resources

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Supabase RLS Docs](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Realtime Docs](https://supabase.com/docs/guides/realtime)
- [LifeLink README](README.md)
- [LifeLink Troubleshooting](TROUBLESHOOTING.md)
