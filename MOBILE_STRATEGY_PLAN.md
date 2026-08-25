# 📱 LifeLink Multi-Platform Strategy Plan

**Current Status:** ✅ **Core Implementation Complete** — Donor native app is functional with all Phase 2 features delivered.

---

## 🎯 Goal

Transition LifeLink from a unified web portal into a specialized ecosystem:

1. **Hospital Web Portal** — Desktop-optimized professional dashboard for medical facilities
2. **Donor Native App** — Cross-platform (iOS/Android/Desktop) application for instant donor engagement

---

## 🏗️ Phase 1: Architectural Split — ✅ COMPLETE

### Monorepo Structure (Implemented)
```
LifeLink/
├── hospital_web/          # React 18 + CRA (desktop-optimized)
├── donor_app/             # Expo 55 + React Native + TypeScript
├── scripts/               # Shared startup scripts (IP detection, concurrent launch)
└── supabase_schema.sql    # Single source of truth for database
```

### Technology Stack (Donor App)
| Layer | Choice | Rationale |
|-------|--------|-----------|
| **Framework** | React Native + Expo 55 | Reuse React knowledge; 100% native performance |
| **Routing** | Expo Router (file-based) | Type-safe, matches web mental model |
| **Language** | TypeScript | Type safety for medical-critical data |
| **State** | React hooks + Supabase Realtime | No Redux/Zustand needed; server is source of truth |
| **Maps** | react-native-maps (Google Maps/Apple Maps) | Native GPU-accelerated; no token needed |
| **Notifications** | Expo Push (FCM/APNs) | Cross-platform; critical alerts support |
| **Security** | Expo SecureStore (Keychain/Keystore) | Hardware-encrypted token storage |
| **Desktop** | Expo Web + Electron (planned) | Single codebase for PC/Mac donor app |

---

## 🚀 Phase 2: Donor App Features — ✅ DELIVERED

### 1. High-Reliability Notifications
| Feature | Status | Implementation |
|---------|--------|----------------|
| **Expo Push Notifications** | ✅ Complete | `usePushNotifications` hook; token saved to `push_subscriptions` |
| **Android High-Importance Channel** | ✅ Complete | Custom vibration pattern, light color, bypasses Doze |
| **iOS Critical Alerts** | 🔄 Ready | Requires Apple entitlement; `Notifications.setNotificationHandler` configured |
| **Web Push Fallback** | ✅ Complete | VAPID keys; Service Worker in `hospital_web/public/sw.js` |
| **Test Mode** | ✅ Complete | "Simulate Emergency Alert" button fires local notification |

### 2. Native Geolocation & Privacy
| Feature | Status | Implementation |
|---------|--------|----------------|
| **Foreground GPS** | ✅ Complete | `expo-location` on onboarding + map |
| **Background Tracking** | 🔄 Hooks Ready | Only when `donor.available === true` |
| **Geofencing** | 🔄 Hooks Ready | `startGeofencingAsync` for city-entry alerts |
| **Location Jitter** | ✅ Complete | ±200m random offset applied before map render (both apps) |
| **Coordinate Storage** | ✅ Complete | `latitude`, `longitude` columns in `donors` table |

### 3. Biometric Security
| Feature | Status | Implementation |
|---------|--------|----------------|
| **SecureStore Adapter** | ✅ Complete | Custom `ExpoSecureStoreAdapter` in `lib/supabase.ts` |
| **FaceID / TouchID** | 🔄 Ready | `expo-local-authentication` installed; `LocalAuthentication.authenticateAsync()` pattern documented |
| **Auto Session Refresh** | ✅ Complete | `AppState` listener manages `startAutoRefresh`/`stopAutoRefresh` |

### 4. Emergency Engine
| Feature | Status | Implementation |
|---------|--------|----------------|
| **Real-time Matching** | ✅ Complete | `useRequests` hook filters by `blood_group`; `postgres_changes` subscription |
| **Blood Compatibility** | ✅ Complete | `getCompatibleDonorGroups()` from shared `bloodLogic.js` |
| **Response Flow** | ✅ Complete | Alert → Confirm (haptic) → ETA → Hospital sees phone |
| **Optimistic Updates** | ✅ Complete | Immediate UI feedback before server confirmation |

---

## 🏥 Phase 3: Hospital Web Enhancements — ✅ DELIVERED

| Feature | Status | Implementation |
|---------|--------|----------------|
| **Desktop Optimization** | ✅ Complete | Multi-pane layout; no mobile breakpoints; keyboard shortcuts ready |
| **Data Exports** | 🔄 Planned | CSV/PDF for request history |
| **Verification Dashboard** | 🔄 Partial | `is_verified` flag in schema; Admin tab exists (`AdminDashboard.jsx`) |
| **Advanced Response Mgmt** | ✅ Complete | Expandable cards, phone reveal, status workflow (open → in_progress → closed) |
| **Network Map** | ✅ Complete | MapLibre GL; hospitals, donors (jittered), active requests |

---

## 📈 Implementation Timeline

| Week | Focus | Status | Deliverables |
|------|-------|--------|--------------|
| **1** | Restructure | ✅ Complete | Monorepo split; shared scripts |
| **2** | Mobile Foundation | ✅ Complete | Anonymous Auth, SecureStore, Expo Router |
| **3** | Emergency Engine | ✅ Complete | Real-time matching, blood logic, response flow |
| **4** | Native Alerts | ✅ Complete | Expo Push, Web Push, Simulation mode |
| **5** | Maps & Location | ✅ Complete | react-native-maps, MapLibre, jitter privacy |
| **6** | Polish & Hardening | ✅ Complete | RLS verified, haptics, offline support, TypeScript |

---

## 🔧 Current Project Configuration

### Supabase Project
- **URL:** `https://hqdiqjswknukqyghtgsa.supabase.co`
- **Project Ref:** `hqdiqjswknukqyghtgsa`

### CLI Setup (for local development)
```bash
# One-time setup
supabase login
supabase init
supabase link --project-ref hqdiqjswknukqyghtgsa

# Deploy Edge Functions
supabase functions deploy send-blood-alert

# Pull schema changes
supabase db pull
```

### Environment Variables Required
```dotenv
# hospital_web/.env
REACT_APP_SUPABASE_URL=https://hqdiqjswknukqyghtgsa.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
REACT_APP_VAPID_PUBLIC_KEY=your-vapid-public-key

# donor_app/.env
EXPO_PUBLIC_SUPABASE_URL=https://hqdiqjswknukqyghtgsa.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## ❓ Open Decisions for Production

### 1. App Store Distribution
| Platform | Cost | Timeline | Decision Needed |
|----------|------|----------|-----------------|
| **iOS App Store** | $99/year | 2-4 weeks review | Developer Program enrollment |
| **Google Play Store** | $25 one-time | 1-3 days review | Play Console setup |
| **Internal/Enterprise** | Free | Immediate | Ad Hoc / TestFlight / Internal testing |

### 2. Desktop Donor App Priority
- **Option A:** iOS/Android first, desktop later (recommended)
- **Option B:** Expo Web + Electron wrapper now (adds ~2 weeks)
- **Current:** Codebase supports both; `expo start --web` works today

### 3. Hospital Portal Domain
- **Current:** `localhost:3000` / deployed to Vercel/Netlify
- **Production:** `hospital.lifelink.com` or `app.lifelink.com/hospital`
- **Decision:** Subdomain vs path-based routing

### 4. Push Infrastructure Scaling
- **Current:** Expo Push (free tier: generous)
- **Scale:** Consider dedicated FCM/APNs or OneSignal for >100k users
- **Cost:** Expo Push included; dedicated has per-message costs

### 5. SMS Provider
- **Current:** Twilio (simulation mode works without)
- **Alternative:** Plivo, Vonage, or Supabase Edge Function with any HTTP SMS API
- **Decision:** Lock in provider before production launch

---

## 🎯 Next Steps (Priority Order)

| Priority | Task | Effort | Dependencies |
|----------|------|--------|--------------|
| **P0** | Apple Developer Program enrollment | 1 week | Required for iOS Critical Alerts |
| **P0** | Google Play Console setup | 1 day | Required for Android release |
| **P1** | Deploy `send-blood-alert` Edge Function with real secrets | 30 min | Twilio account + VAPID keys |
| **P1** | Configure `is_verified` for production hospitals | Manual | Admin dashboard or SQL |
| **P2** | Build standalone iOS/Android binaries (EAS) | 1 hour | Certificates + profiles |
| **P2** | Set up EAS Build pipelines | 1 hour | Expo account |
| **P3** | Desktop donor app (Electron wrapper) | 1 week | Optional |
| **P3** | Hospital data exports (CSV/PDF) | 2 days | `hospital_web` only |
| **P4** | Advanced geofencing/background location | 1 week | Requires App Store permissions |

---

## 📊 Architecture Decision Log

| Decision | Date | Rationale |
|----------|------|-----------|
| **Monorepo (not npm workspaces)** | Week 1 | Simpler CI; shared SQL schema; no version sync needed |
| **Expo over bare React Native** | Week 2 | Managed workflow; push, maps, biometrics work out of box |
| **Anonymous Auth for donors** | Week 2 | Zero friction = higher conversion in emergencies |
| **RLS-only security (no custom API)** | Week 1 | Supabase handles authz; less code = fewer bugs |
| **MapLibre (not Mapbox)** | Week 3 | No token cost; open source; sufficient for emergency viz |
| **Simulation mode for all external services** | Week 4 | Zero-config demos; CI-friendly; no secrets in repo |

---

## 🔗 Related Documentation

- **[README.md](./README.md)** — Quick start & architecture overview
- **[FEATURES_WALKTHROUGH.md](./FEATURES_WALKTHROUGH.md)** — Complete feature inventory & testing
- **[SUPABASE_SETUP_GUIDE.md](./SUPABASE_SETUP_GUIDE.md)** — Database, Auth, Edge Functions setup
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** — Common issues & fixes
- **[SECURITY_PENTEST_REPORT.md](./SECURITY_PENTEST_REPORT.md)** — Security audit & hardening status