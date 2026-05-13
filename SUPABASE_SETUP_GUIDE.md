# ⚡ Supabase Setup & Configuration

This guide ensures your Supabase backend is perfectly configured for the LifeLink monorepo.

---

## 1. Database Schema
You must run the SQL in **[`supabase_schema.sql`](file:///hospital_web/supabase_schema.sql)** to set up the following:

| Table | Purpose | Security |
| :--- | :--- | :--- |
| `profiles` | User roles & metadata | RLS: Owner Only |
| `donors` | Donor records & locations | RLS: Role-Based |
| `hospitals` | Facility details | RLS: Verified Only |
| `blood_requests` | Active emergencies | RLS: Public/Targeted |
| `push_subscriptions` | Web Push tokens | RLS: Owner Only |

---

## 2. Authentication Settings
> [!IMPORTANT]
> Enable the following in your Supabase Auth Settings:
1. **Email/Password**: For Hospital staff registration.
2. **Anonymous Sign-ins**: For frictionless Donor onboarding.
3. **Redirect URL**: Set to `http://localhost:3000` (or your production URL).

---

## 3. Realtime Enablement
Ensure **Replication** is turned on for the following tables to enable the "Instant Dashboards":
- `blood_requests`
- `donor_responses`
- `donors`

---

## 4. Edge Functions (Advanced)
To enable real SMS and Push notifications, deploy the functions in the `/supabase/functions` directory:
```bash
supabase functions deploy send-blood-alert
```

### Required Secrets
Set these in your Supabase dashboard:
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_FROM_NUMBER`
- `VAPID_PRIVATE_KEY`

---

## 5. Security Hardening
> [!CAUTION]
> Always verify that **RLS is ENABLED** for every table. You can check this in the "Database" -> "Tables" section of your Supabase dashboard.
