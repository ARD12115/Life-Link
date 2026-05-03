# 🩸 Life Link — Real-time Emergency Blood Donor Matching

Life Link connects hospitals that need blood **right now** with available, matched donors — with zero page refreshes, powered by Supabase Realtime and Row-Level Security.

---

## ✅ Status: Production-Ready

**Latest Updates:**
- ✅ Supabase integration with email/password authentication (magic link disabled)
- ✅ Role-based access control (Hospital/Donor)
- ✅ Row-Level Security (RLS) with simplified policies (recursion fixed)
- ✅ Profiles table for user role management
- ✅ Real-time data syncing
- ✅ GitHub repository linked and pushed
- ✅ Environment variables configured
- ✅ MCP server configured
- ✅ Agent skills installed
- ✅ Database connection setup
- ✅ Code reviewed and tested

---

## ⚡ Quick Setup

### 1. Environment Variables (Done ✅)

Your `.env` file contains:
```
REACT_APP_SUPABASE_URL=https://hqdiqjswknukqyghtgsa.supabase.co
REACT_APP_SUPABASE_PUBLISHABLE_KEY=sb_publishable_Nsi9ZmjBsb5wJfLipIvmCQ_iPAIH3CT
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.hqdiqjswknukqyghtgsa.supabase.co:5432/postgres
```

**⚠️ Important:** Replace `[YOUR-PASSWORD]` with your actual database password from Supabase dashboard (Settings > Database > Password). Never commit real credentials to GitHub.

**Note:** These are public keys (safe to commit). Sensitive operations use Row-Level Security policies.

### 1.5 Role Flow and Switching
The app uses a single Supabase authenticated user record and a separate `profiles` row to store role selection.

- First login: choose Hospital or Donor
- Same email login: app restores the saved role
- To switch roles: click **Switch Role** in the dashboard header, confirm, then re-register

This is expected behavior for testing both roles in the same browser session.

### 2. Database Schema (Done ✅)

The `supabase_schema.sql` file is applied to your hosted Supabase database with:
- ✅ 5 tables: `profiles`, `donors`, `hospitals`, `blood_requests`, `donor_responses`
- ✅ Row-Level Security policies (simplified to avoid recursion)
- ✅ Realtime configuration on core tables
- ✅ Cascading deletes for data integrity

### 3. MCP Configuration (Done ✅)

MCP server is configured in `.vscode/mcp.json`:
```json
{
  "servers": {
    "supabase": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp?project_ref=hqdiqjswknukqyghtgsa"
    }
  },
  "inputs": []
}
```

### 4. Agent Skills (Done ✅)

Supabase agent skills are installed for enhanced development experience.

### 5. Dependencies (Done ✅)

Required packages installed:
- `@supabase/supabase-js`: Supabase client library
- `postgres`: PostgreSQL client for direct database connections
- `lucide-react`: Icons
- `react-scripts`: Build tools

### 6. Database Connection (Done ✅)

`db.js` file created for direct PostgreSQL connections using the postgres package.

### 7. Install dependencies and start

```bash
npm install
npm start
```

The app opens at [http://localhost:3000](http://localhost:3000).

---

## 🔐 Authentication & Authorization

### Email & Password Authentication
Users log in using standard email and password credentials:
```javascript
await supabase.auth.signInWithPassword({
  email: 'user@hospital.com',
  password: 'user_password'
})
```

### Role-Based Access Control
After authentication, users select their role (Hospital or Donor):
- **Hospital**: Create blood requests, manage donor responses
- **Donor**: Receive alerts, respond to requests, manage availability

Roles are stored in the `profiles` table with Row-Level Security policies ensuring users can only see authorized data.

### Row-Level Security (RLS)
All tables enforce strict RLS policies:
- Hospitals can only manage their own requests
- Donors can only see alerts assigned to them
- Policies use `DO` blocks for idempotent application

---

## 🗺️ File map

| File | Purpose |
|---|---|
| `public/index.html` | HTML shell — Google Fonts, meta tags, global CSS reset |
| `src/index.js` | React 18 entry point |
| `src/App.jsx` | Top-level auth & profile router |
| `src/components/Auth.jsx` | Email/password login and sign up screen |
| `src/components/RoleSelector.jsx` | Hospital/Donor role selection (onboarding) |
| `src/components/HospitalDashboard.jsx` | Hospital view: create requests, manage responses |
| `src/components/DonorDashboard.jsx` | Donor view: receive alerts, respond to requests |
| `src/components/SupabaseDropdowns.jsx` | Example component: donor/hospital data display |
| `src/components/DebugDashboard.jsx` | Debug panel: connection testing, diagnostics |
| `src/lib/supabase.js` | Supabase client initialization |
| `src/hooks/useRequests.js` | Fetches blood requests with realtime sync |
| `src/hooks/useDonors.js` | Fetches donors/hospitals with realtime sync |
| `src/context/ThemeContext.js` | Light/dark/system theme management |
| `supabase_schema.sql` | Database schema with RLS policies (applied ✅) |
| `prisma/schema.prisma` | Optional: ORM schema for future backend services |

---

## 🔴 Real-time behavior

Open the app in **two browser tabs** side by side:

| Tab 1 (Hospital staff) | Tab 2 (Blood donor) |
|---|---|
| Log in with hospital email → Select "Hospital" role | Log in with donor email → Select "Donor" role |
| Click **New Request** → select B+ → post | Tab 2 instantly shows the alert for matching donors |
| — | Click **I can donate** on any alert |
| Request card updates to "In progress" | Confirmed banner shows status |
| Click the card → see the confirmed donor | — |

No page refresh required — Supabase Realtime pushes all changes.

---

## 🚀 Next steps

| Feature | Status | How |
|---|---|---|
| **Authentication** | ✅ Done | Email/password with Supabase Auth |
| **Role-based access** | ✅ Done | Profiles table + RLS policies |
| **Real-time sync** | ✅ Done | Supabase Realtime channels |
| **SMS alerts** | ⏳ Pending | Create a Supabase Edge Function that calls Twilio |
| **Maps** | ⏳ Pending | Embed Mapbox GL JS with hospital locations |
| **Blood compatibility** | ⏳ Pending | Expand matching logic beyond exact blood group |
| **Push notifications** | ⏳ Pending | Web Push API + Edge Function for browser notifications |
| **Deploy to Vercel** | ⏳ Ready | `npm run build` → push to GitHub → import into Vercel |

---

## 🏗️ Tech stack

- **Frontend**: React 18 + Context API for themes
- **Backend**: Supabase (PostgreSQL + Realtime + Auth + RLS)
- **ORM**: Prisma 5.17.0 (optional, for future backend services)
- **Icons**: lucide-react
- **Styling**: CSS-in-JS (inline styles)

---

## 🧪 Testing the App

1. **Visit** http://localhost:3000
2. **Login** with your email and password
3. **Select Role** (Hospital or Donor)
4. **Open DevTools** (F12 → Console) to monitor real-time sync
5. **Open two tabs** to see real-time updates across devices

---

## 📚 Documentation

- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) — Common issues and fixes
- [SUPABASE_SETUP_GUIDE.md](SUPABASE_SETUP_GUIDE.md) — Detailed Supabase setup
- [QUICK_REFERENCE.md](QUICK_REFERENCE.md) — Quick lookup guide
- [DEV_SKILL_GUIDELINES.md](DEV_SKILL_GUIDELINES.md) — Developer workflow and documentation process
- [Prompt.txt](Prompt.txt) — Full conversation context for AI assistance

---

## 🔗 Resources

- Supabase Project: `https://app.supabase.com/project/[your-project-id]`
- GitHub Repository: https://github.com/1LifeLink1/LifeLink
- React Documentation: https://react.dev
- Supabase Documentation: https://supabase.com/docs

---

> Built with security-first approach. Row-Level Security policies ensure proper data isolation. For production, add rate-limiting on the Edge and implement additional audit logging.