# ⚡ Supabase Setup & Configuration Guide

Complete step-by-step configuration for the LifeLink monorepo backend. This guide reflects the **actual implemented schema and patterns** in the codebase.

---

## 1. Database Schema

Run the SQL in **`hospital_web/supabase_schema.sql`** in your Supabase SQL Editor. This creates:

| Table | Purpose | Key Columns | RLS Status |
|-------|---------|-------------|------------|
| `profiles` | User roles & metadata | `user_id` (PK), `role` (hospital/donor/admin), `display_name`, `phone` | ✅ Enabled |
| `donors` | Donor records & locations | `id`, `user_id`, `name`, `blood_group`, `city`, `phone`, `available`, `last_donated`, `total_donations`, `latitude`, `longitude` | ✅ Enabled |
| `hospitals` | Facility details | `id`, `user_id`, `name`, `city`, `contact_person`, `phone`, `is_verified`, `latitude`, `longitude` | ✅ Enabled |
| `blood_requests` | Active emergencies | `id`, `hospital_id`, `blood_group`, `component`, `units_needed`, `urgency`, `status`, `delivery_point`, `notes` | ✅ Enabled |
| `donor_responses` | Response tracking | `id`, `request_id`, `donor_id`, `status`, `eta_minutes`, `responded_at` | ✅ Enabled |
| `push_subscriptions` | Push tokens (web + native) | `id`, `user_id`, `subscription` (JSONB) | ✅ Enabled |

### Key Schema Details

**Blood Group Constraints** (enforced at DB level):
```sql
check (blood_group in ('A+','A-','B+','B-','O+','O-','AB+','AB-'))
```

**Component Types:**
```sql
check (component in ('Whole blood','Platelets','Plasma','RBC'))
```

**Urgency Levels:**
```sql
check (urgency in ('Routine','Urgent','Critical'))
```

**Request Status Flow:**
```sql
check (status in ('open','in_progress','closed','cancelled'))
```

**Response Status Flow:**
```sql
check (status in ('alerted','confirmed','declined','donated'))
```

---

## 2. Row-Level Security (RLS) Policies

All policies are defined in `supabase_schema.sql`. Summary:

### `profiles`
- **Owner only**: Users can only read/write their own profile

### `donors`
- **Owner manage**: Donors full CRUD on their record
- **Hospital read basic**: Verified hospitals can `SELECT` name, blood_group, city, available (NOT phone)
- **Phone reveal**: Hospital sees phone ONLY if donor has `confirmed` response to their request (via join in `donor_responses`)

### `hospitals`
- **Owner manage**: Hospitals full CRUD on their record
- **Donor read**: Donors can `SELECT` hospital list (name, city, contact, phone) for directory

### `blood_requests`
- **Hospital manage**: Hospital owns their requests (join via `hospitals.user_id = auth.uid()`)
- **Donor view assigned**: Donors can `SELECT` requests they've responded to (join via `donor_responses`)

### `donor_responses`
- **Donor manage**: Donor updates their own responses
- **Hospital manage**: Hospital manages responses for their requests

### `push_subscriptions`
- **Owner only**: Users manage their own push tokens

---

## 3. Authentication Settings

In **Supabase Dashboard → Authentication → Providers**:

| Provider | Required? | Purpose |
|----------|-----------|---------|
| **Email/Password** | ✅ Yes | Hospital staff registration & login |
| **Anonymous Sign-ins** | ✅ Yes | Zero-friction donor onboarding |
| **Redirect URL** | ✅ Yes | Set to `http://localhost:3000` (dev) or your production URL |

> **Critical**: Anonymous sign-ins MUST be enabled or donor onboarding will fail with "Invalid login credentials".

---

## 4. Realtime Enablement

In **Supabase Dashboard → Database → Replication**, enable for:

- `blood_requests` — powers live emergency feed
- `donor_responses` — powers live response updates
- `donors` — powers live donor directory/map updates

> Tables in `public` schema are auto-available for realtime once replication is enabled.

---

## 5. Edge Functions (Production Alerts)

Deploy the `send-blood-alert` function for real SMS/Push:

```bash
# From hospital_web/ directory
supabase functions deploy send-blood-alert
```

### Required Secrets (Dashboard → Edge Functions → Secrets)
| Secret | Source | Purpose |
|--------|--------|---------|
| `TWILIO_ACCOUNT_SID` | Twilio Console | SMS provider auth |
| `TWILIO_AUTH_TOKEN` | Twilio Console | SMS provider auth |
| `TWILIO_FROM_NUMBER` | Twilio Console | Sender phone number |
| `VAPID_PRIVATE_KEY` | `npx web-push generate-vapid-keys` | Web Push encryption |

### Function Trigger (from HospitalDashboard.jsx)
```javascript
// Only for Urgent/Critical requests
const { data, error } = await supabase.functions.invoke('send-blood-alert', {
  body: {
    requestId: data.id,
    hospitalName: myHospital.name,
    bloodGroup: form.blood_group,
    urgency: form.urgency
  }
})
```

**Simulation Mode**: If function fails (missing secrets), UI logs mock alert to console — no external services needed for development.

---

## 6. Environment Variables

### Hospital Web (`hospital_web/.env`)
```dotenv
# Supabase (required)
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
# Accepts both ANON_KEY and PUBLISHABLE_KEY naming

# Web Push (required for browser notifications)
REACT_APP_VAPID_PUBLIC_KEY=your-vapid-public-key

# Expo Bridge (for QR code on landing page)
REACT_APP_EXPO_URL=exp://your-lan-ip:8081
# Auto-populated by npm start script via scripts/get-ip.js
```

### Donor App (`donor_app/.env`)
```dotenv
# Supabase (required) - EXPO_PUBLIC_ prefix for Expo
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Optional: falls back to REACT_APP_ vars for compatibility
# REACT_APP_SUPABASE_URL=...
# REACT_APP_SUPABASE_ANON_KEY=...
```

### Generate VAPID Keys
```bash
npx web-push generate-vapid-keys
# Output:
# Public Key:  BFxxx... (add to REACT_APP_VAPID_PUBLIC_KEY)
# Private Key:  xxxx... (add to Supabase Edge Function secrets as VAPID_PRIVATE_KEY)
```

---

## 7. Storage (Optional)

If you add profile images or document uploads:

1. Create bucket: `donor-avatars` / `hospital-docs`
2. Set RLS policies on `storage.objects`
3. Use `supabase.storage.from('bucket').upload()` in components

---

## 8. Verification Checklist

After setup, verify:

- [ ] All 6 tables exist with correct columns
- [ ] RLS enabled on all tables (check "Policies" tab)
- [ ] Replication enabled for `blood_requests`, `donor_responses`, `donors`
- [ ] Email/Password provider enabled
- [ ] Anonymous provider enabled
- [ ] Redirect URL configured
- [ ] `.env` files created in both apps with correct keys
- [ ] `npm run install-all` completes without errors
- [ ] `npm start` launches both apps
- [ ] Hospital can sign up → register facility → create request
- [ ] Donor can open app → onboard anonymously → receive alert
- [ ] Real-time sync works between both apps

---

## 9. Common Issues

| Issue | Fix |
|-------|-----|
| "Invalid login credentials" on anonymous sign-in | Enable Anonymous provider in Supabase Auth |
| Donor phone not visible to hospital | Check RLS: hospital must have verified status + donor must have `confirmed` response |
| Realtime not working | Enable Replication for the specific tables |
| Edge Function 401/500 | Check secrets are set in Supabase Dashboard (not .env) |
| Map not loading | Ensure MapLibre GL (not Mapbox) — no token needed |

---

## 10. Production Hardening

Before going live:

- [ ] Set `hospitals.is_verified = true` manually for approved facilities
- [ ] Configure custom SMTP in Supabase Auth for password emails
- [ ] Set up Supabase Database backups (Point-in-Time Recovery)
- [ ] Enable Supabase WAF / rate limiting
- [ ] Configure custom domain for Supabase project
- [ ] Move Edge Function secrets to Supabase Vault (not dashboard)
- [ ] Set up monitoring: Logflare / Datadog / Sentry