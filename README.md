# 🩸 Life Link — Real-time Emergency Blood Donor Matching

Life Link connects hospitals that need blood **right now** with available, matched donors — with zero page refreshes, powered by Supabase Realtime.

---

## ⚡ Quick Setup

### 1. Create a Supabase project

1. Go to [https://supabase.com](https://supabase.com) and sign in.
2. Click **New project**, choose a name (e.g. `lifelink`) and a strong database password.
3. Wait ~1 minute for the project to spin up.

### 2. Run the database schema

1. In your Supabase project, click **SQL Editor** in the left sidebar.
2. Click **New query**, then paste the entire contents of `supabase_schema.sql`.
3. Click **Run**. This will:
   - Create the four tables (`donors`, `hospitals`, `blood_requests`, `donor_responses`)
   - Enable Realtime on `blood_requests` and `donor_responses`
   - Set up Row Level Security (allow-all policies for demo)
   - Seed 3 hospitals and 6 donors across different blood groups

### 3. Paste your API keys

1. In Supabase, go to **Project Settings → API**.
2. Copy your **Project URL** and **anon / public key**.
3. Open `src/lib/supabase.js` and replace the placeholders:

```js
const SUPABASE_URL      = 'https://xxxxxxxxxxxx.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGci...'
```

### 4. Install dependencies and start

```bash
npm install
npm start
```

The app opens at [http://localhost:3000](http://localhost:3000).

---

## 🗺️ File map

| File | Purpose |
|---|---|
| `public/index.html` | HTML shell — Google Fonts, meta tags, global CSS reset |
| `src/index.js` | React 18 entry point |
| `src/App.jsx` | Top-level view switcher (Hospital staff / Blood donor) |
| `src/lib/supabase.js` | Supabase client — **paste your keys here** |
| `src/hooks/useRequests.js` | Fetches all blood requests (joined with hospitals + donor responses). Subscribes to Postgres Realtime on both `blood_requests` and `donor_responses` tables. |
| `src/hooks/useDonors.js` | Fetches donors and hospitals. Real-time donor availability updates. |
| `src/components/HospitalDashboard.jsx` | Hospital view: stat cards, request list, donor-response expansion, status controls, new-request modal with live donor-match count. |
| `src/components/DonorDashboard.jsx` | Donor view: profile card, availability toggle, alert response (confirm / decline / donated), all open requests. |
| `supabase_schema.sql` | Full SQL — tables, RLS policies, Realtime setup, seed data. |

---

## 🔴 Realtime behaviour

Open the app in **two browser tabs** side by side:

| Tab 1 (Hospital staff) | Tab 2 (Blood donor) |
|---|---|
| Click **New request** → select B+ → post | Tab 2 instantly shows the alert for Rahul Kumar or Arjun Shetty |
| — | Click **I can donate** on any alert |
| Request card updates to "In progress" | Confirmed banner shows ETA |
| Click the card → see the confirmed donor | — |

No page refresh required — Supabase Realtime pushes all changes.

---

## 🚀 Next steps

| Feature | How |
|---|---|
| **Authentication** | Add `supabase.auth.signInWithOtp()` (magic link) or phone OTP. Gate Hospital vs Donor views by user role stored in a `profiles` table. |
| **SMS alerts** | Create a Supabase Edge Function that calls the [Twilio Messages API](https://www.twilio.com/docs/sms) whenever a new `donor_response` row with `status = 'alerted'` is inserted. |
| **Maps** | Embed a [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/guides/) map on the donor dashboard showing hospital pins. Store `lat/lon` on the hospitals table. |
| **Blood compatibility** | Expand matching logic beyond exact blood group — O- donors are universal, AB+ recipients accept all. Add a `compatible_groups` helper function. |
| **Push notifications** | Use the [Web Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API) + a Supabase Edge Function to send browser notifications to donors even when the tab is not open. |
| **Deploy to Vercel** | `npm run build` → push to GitHub → import repo into [Vercel](https://vercel.com). Add `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_ANON_KEY` as environment variables. |

---

## 🏗️ Tech stack

- **Frontend**: React 18, inline styles only (zero CSS deps)
- **Backend**: [Supabase](https://supabase.com) — PostgreSQL + Realtime + Row Level Security
- **Icons**: [lucide-react](https://lucide.dev)
  
---

> Built for rapid prototyping. For production, add auth, rate-limiting on the Edge, and proper RLS policies scoped to authenticated users.
