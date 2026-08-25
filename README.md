<p align="center">
  <img src="hospital_web/public/LOGO.png" alt="LifeLink Logo" width="120" />
</p>

<h1 align="center">LifeLink</h1>

<p align="center">
  <strong>The Ultimate Emergency Blood Donor Ecosystem.</strong><br/>
  Connecting hospitals with donors through military-grade security and instant native notifications.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Status-Production--Ready-success" alt="Production Ready" />
  <img src="https://img.shields.io/badge/Platform-Web%20%2B%20Mobile-blue" alt="Web + Mobile" />
  <img src="https://img.shields.io/badge/Security-Hardened-red" alt="Security Hardened" />
  <img src="https://img.shields.io/badge/Architecture-Monorepo-purple" alt="Monorepo" />
</p>

---

## 🏗️ Project Architecture

LifeLink is a specialized **monorepo** designed for scale, security, and real-time emergency coordination:

| Component | Technology | Purpose |
|-----------|------------|---------|
| **`/hospital_web`** | React 18 + Vite/CRA + Supabase JS | Professional desktop dashboard for medical facility staff |
| **`/donor_app`** | Expo 55 + React Native + TypeScript | Native iOS, Android, and PC application for blood donors |
| **Backend** | Supabase (PostgreSQL) | Hardened database with RLS, Realtime, Auth, Edge Functions |

### Key Design Decisions
- **No custom backend server** — Supabase handles Auth, Database, Realtime, Storage, and Edge Functions
- **Client-side Supabase** — Both apps use `@supabase/supabase-js` directly (no `@supabase/ssr` or middleware needed)
- **RLS-first security** — All data access controlled by Row-Level Security policies
- **Real-time by default** — `postgres_changes` subscriptions power live dashboards

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Supabase project (free tier works)
- Expo CLI (`npm i -g expo-cli`)

### 1. Clone & Configure
```bash
# Environment files (copy templates and fill in your Supabase credentials)
cp hospital_web/.env.example hospital_web/.env
cp donor_app/.env.example donor_app/.env
```

**Required variables:**
```dotenv
# hospital_web/.env
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
REACT_APP_VAPID_PUBLIC_KEY=your-vapid-public-key  # for web push
REACT_APP_EXPO_URL=exp://your-ngrok-or-lan-url:8081  # for QR code on landing page

# donor_app/.env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 2. Database Setup
1. Go to your Supabase Dashboard → SQL Editor
2. Run the contents of `hospital_web/supabase_schema.sql`
3. Enable **Realtime** for tables: `blood_requests`, `donor_responses`, `donors`
4. In **Authentication → Providers**, enable:
   - ✅ Email/Password (for hospitals)
   - ✅ Anonymous Sign-ins (for donors)

### 3. Install & Run
```bash
# From root LifeLink directory
npm run install-all   # Installs root, hospital_web, and donor_app deps
npm start             # Launches BOTH apps concurrently
```

This starts:
- **Hospital Web** → `http://localhost:3000` (React dev server)
- **Donor App** → Expo dev server (scan QR with Expo Go or run on simulator)

---

## 🔐 Privacy & Security

| Feature | Implementation |
|---------|----------------|
| **Data Masking** | PII protected via database-level RLS; phone numbers only visible to hospitals after donor responds |
| **Location Jitter** | Donor coordinates randomized by ±200m on maps to protect home addresses |
| **Biometric SecureStore** | Session tokens hardware-encrypted on mobile via Expo SecureStore |
| **Anonymous Auth** | Donors onboard frictionlessly without email/password |
| **Hospital Verification** | `is_verified` flag prevents fake hospitals from spamming alerts |

---

## 📚 Documentation

| File | Purpose |
|------|---------|
| **[FEATURES_WALKTHROUGH.md](./FEATURES_WALKTHROUGH.md)** | Complete feature guide & testing steps |
| **[SUPABASE_SETUP_GUIDE.md](./SUPABASE_SETUP_GUIDE.md)** | Database schema, Auth, Realtime, Edge Functions |
| **[MOBILE_STRATEGY_PLAN.md](./MOBILE_STRATEGY_PLAN.md)** | Architecture decisions & platform roadmap |
| **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** | Common issues & fixes |
| **[CONTRIBUTING.md](./CONTRIBUTING.md)** | Contribution guidelines & standards |
| **[DEV_SKILL_GUIDELINES.md](./DEV_SKILL_GUIDELINES.md)** | Code patterns, real-time rules, security practices |
| **[SECURITY_PENTEST_REPORT.md](./SECURITY_PENTEST_REPORT.md)** | Security audit results & hardening status |
| **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** | Command cheat sheet & key links |

---

## 🧪 Simulation Mode (No External Services Needed)

Test the full flow without Twilio, VAPID, or Mapbox:

| Feature | How to Test |
|---------|-------------|
| **Native Push** | Donor App → "Simulate Emergency Alert" button |
| **SMS/Alert Logic** | Hospital Dashboard → Create "Critical" request → Check browser console (F12) for mock logs |
| **Privacy Map** | Zoom into any donor marker to see 200m randomized offset |
| **Real-time Sync** | Open both apps side-by-side; create request in Hospital → appears instantly in Donor |

---

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for:
- Branching strategy
- PR requirements (screenshots/video required for UI changes)
- Security-first review process
- Code style (Glassmorphism design system, 44px touch targets)

---

## 📜 License

MIT — Built to save lives. 🩸

---

<p align="center">Saving lives through high-performance engineering. 🩸</p>