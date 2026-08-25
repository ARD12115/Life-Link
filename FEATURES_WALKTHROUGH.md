# 🚶‍♂️ LifeLink Features Walkthrough

Complete guide to every implemented feature in the LifeLink monorepo. Use this to test, demo, or understand the system.

---

## 🏥 Hospital Web Portal (`/hospital_web`)

**Tech:** React 18, React Router v7, Supabase Realtime, MapLibre GL, react-hot-toast

### 1. Authentication & Onboarding
| Feature | Implementation |
|---------|----------------|
| **Email/Password Sign Up** | Standard Supabase Auth; creates `profiles` row with `role: 'hospital'` |
| **Hospital Registration** | First-time users complete facility form (name, city, contact, phone, optional GPS) |
| **Auto GPS Capture** | Browser Geolocation API captures lat/lng during registration (fallback to city-only) |
| **Session Persistence** | Supabase handles refresh tokens; `onAuthStateChange` keeps UI in sync |

### 2. Emergency Request Management
| Feature | Implementation |
|---------|----------------|
| **Create Request Modal** | Blood group (8 types), Component (Whole/Platelets/Plasma/RBC), Units (± buttons), Urgency (Routine/Urgent/Critical), Delivery Point, Notes |
| **Smart Donor Matching** | On submit: queries compatible donors via `getCompatibleDonorGroups()` (bloodLogic.js), creates `donor_responses` rows with `status: 'alerted'` |
| **Auto SMS/Push Trigger** | Urgent/Critical requests invoke `send-blood-alert` Edge Function (simulation mode logs to console if not deployed) |
| **Optimistic UI** | New request appears instantly via `mutateRequests` before server round-trip |
| **Real-time Updates** | `postgres_changes` subscriptions on `blood_requests` + `donor_responses` tables |

### 3. Dashboard Tabs
| Tab | Features |
|-----|----------|
| **Active Emergencies** | Expandable cards showing blood group, component, units, delivery point, urgency badge, status, time ago; expand to see donor responses with phone reveal on accept |
| **Network Map** | MapLibre GL visualization: hospitals (blue), donors (red with 200m jitter), active requests (pulsing); click markers for details |
| **Donor Directory** | Searchable table (filter by blood group); shows name, type, availability status, city, phone (call link); server-side refetch on filter |
| **Past Deliveries** | Chronological log of completed requests with fulfillment notes |

### 4. Response Management
| Action | Flow |
|--------|------|
| **Mark In Progress** | Updates request status; donor sees "In Transit" |
| **Complete Request** | Prompts for receiver name; logs `Received by: [name]`; moves to history |
| **Cancel Request** | Sets status to cancelled; notifies donors |

### 5. Cross-Platform Bridge
- **Expo QR Code** on stats bar → scans to open Donor App in Expo Go
- **Dynamic URL** via `REACT_APP_EXPO_URL` env var (auto-detected by startup script)

---

## 📱 Donor Native App (`/donor_app`)

**Tech:** Expo 55, Expo Router (file-based), React Native 0.83, TypeScript, Supabase JS, Reanimated 4

### 1. Authentication & Security
| Feature | Implementation |
|---------|----------------|
| **Anonymous Sign-In** | `supabase.auth.signInAnonymously()` — zero-friction onboarding |
| **SecureStore Adapter** | Custom `ExpoSecureStoreAdapter` — tokens hardware-encrypted (Keychain/Keystore) |
| **Auto Session Refresh** | `AppState` listener starts/stops `supabase.auth.startAutoRefresh()` on foreground/background |
| **Profile + Role Sync** | Parallel fetch of `donors` + `profiles` tables; role used for Admin tab visibility |

### 2. Onboarding Flow
- **Single Screen Form:** Name, Blood Group (8-button grid), City, Phone
- **GPS Capture** — Optional lat/lng stored with donor record
- **Atomic Profile Creation** — Inserts into `profiles` (role: donor) + `donors` in sequence with error handling

### 3. Dashboard Tabs (Bottom Navigation)
| Tab | Features |
|-----|----------|
| **Alerts (Home)** | Hero impact card (total donations, blood type); Active Missions grid with hospital name, units, urgency, location, "RESPOND NOW" button; haptic feedback on respond; simulation test push button |
| **Map** | Native `react-native-maps` with donor/hospital/request markers; `donorView={true}` shows only relevant emergencies |
| **Admin** | Conditional render (only if `role === 'admin'`); placeholder for system control |

### 4. Emergency Response Flow
1. Donor receives push notification (Expo Push + Web Push fallback)
2. Opens app → Alerts tab shows matching requests for their blood group
3. Taps "I'll Donate" → `donor_responses` updated to `confirmed` with ETA
4. Hospital dashboard updates in real-time; phone number revealed
5. Donor sees confirmation with ETA timer

### 5. Native Capabilities
| Capability | Implementation |
|------------|----------------|
| **Push Notifications** | Expo Push (FCM/APNs); `usePushNotifications` hook registers token, saves to `push_subscriptions`; Android high-importance channel with custom vibration |
| **Background Location** | `expo-location` — only when `available: true`; geofencing ready |
| **Biometrics** | `expo-local-authentication` ready; SecureStore adapter enables future FaceID/TouchID |
| **Haptics** | `expo-haptics` — medium impact on "I'll Donate" tap |
| **Offline Support** | SecureStore persists session; Supabase auto-refresh handles reconnection |

### 6. Simulation Mode
- **Test Push Button** → `Notifications.scheduleNotificationAsync()` fires local notification instantly
- **No backend needed** — Works in Expo Go, simulator, and standalone builds

---

## 🔄 Shared Backend Logic

### Blood Compatibility Engine (`hospital_web/src/lib/bloodLogic.js`)
```javascript
// Recipient → Compatible Donors
'A+':  ['A+', 'A-', 'O+', 'O-']
'A-':  ['A-', 'O-']
'B+':  ['B+', 'B-', 'O+', 'O-']
'B-':  ['B-', 'O-']
'AB+': ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']  // Universal recipient
'AB-': ['AB-', 'A-', 'B-', 'O-']
'O+':  ['O+', 'O-']
'O-':  ['O-']  // Universal donor
```
Used by Hospital Dashboard to auto-alert compatible donors on request creation.

### Realtime Patterns (Both Apps)
```javascript
// Optimistic updates + subscription pattern
const channel = supabase.channel('unique_name')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'table' }, (payload) => {
    if (payload.eventType === 'INSERT') setData(prev => [payload.new, ...prev])
    if (payload.eventType === 'UPDATE') setData(prev => prev.map(i => i.id === payload.new.id ? payload.new : i))
    if (payload.eventType === 'DELETE') setData(prev => prev.filter(i => i.id !== payload.old.id))
  })
  .subscribe()
// Cleanup in useEffect return: supabase.removeChannel(channel)
```

---

## 🧪 Testing Checklist

### Hospital Web
- [ ] Sign up as hospital → complete registration form
- [ ] Create "Critical" B+ request with delivery point "ER Entrance"
- [ ] Verify real-time: open Donor App → request appears instantly
- [ ] Expand request → see donor responses
- [ ] Click donor phone link (only visible after response)
- [ ] Mark "In Progress" → "Complete" → enter receiver name
- [ ] Switch to Map tab → see hospital + donors + request markers
- [ ] Switch to Directory → filter by blood group
- [ ] Switch to History → see completed request with notes

### Donor App
- [ ] Open app → "Become a Hero" onboarding
- [ ] Fill form → anonymous auth → donor record created
- [ ] Enable push notifications (or test with "Simulate Emergency Alert")
- [ ] Hospital creates request → alert appears in Alerts tab
- [ ] Tap "I'll Donate" → haptic feedback → status changes to Confirmed
- [ ] Check ETA display
- [ ] Open Map tab → see network visualization
- [ ] Open Directory → see hospital master/detail view

### Cross-App
- [ ] Hospital QR code → opens Donor App in Expo Go
- [ ] Real-time sync: changes in one app reflect in other <1s
- [ ] Simulation mode works without Twilio/VAPID/Mapbox

---

## 🎯 "WOW" Factors for Demos

| Moment | Why It Impresses |
|--------|------------------|
| **Sub-second alert** | Hospital clicks "Post" → Donor phone buzzes instantly (Realtime) |
| **Blood compatibility** | Hospital requests A+ → O- and A- donors also alerted (medical logic) |
| **Privacy jitter** | Zoom map → donor markers jitter ±200m (privacy by design) |
| **Phone reveal** | Only after donor confirms → hospital can call directly (RLS enforcement) |
| **Native feel** | Expo app: haptics, push, biometrics-ready, offline-capable |
| **Zero-config demo** | Simulation mode = full demo with zero external accounts |

---

## 📱 Mobile Strategy Status

| Phase | Feature | Status |
|-------|---------|--------|
| **Core** | Anonymous Auth + SecureStore | ✅ Complete |
| **Core** | Real-time Emergency Feed | ✅ Complete |
| **Core** | Native Push Notifications | ✅ Complete |
| **Core** | Native Maps + Geolocation | ✅ Complete |
| **Core** | Blood Compatibility Matching | ✅ Complete |
| **Advanced** | Critical Alerts (bypass mute) | 🔄 Ready to enable |
| **Advanced** | Background Geofencing | 🔄 Hooks in place |
| **Advanced** | Biometric Lock Screen | 🔄 SecureStore ready |
| **Platform** | iOS App Store Build | ⏳ Needs certs |
| **Platform** | Android Play Store Build | ⏳ Needs keystore |
| **Platform** | Desktop (Expo Web + Electron) | ⏳ Config only |

---

## 🛡️ Security Features Verified

- [ ] RLS on all 6 tables (`profiles`, `donors`, `hospitals`, `blood_requests`, `donor_responses`, `push_subscriptions`)
- [ ] Donor phone masked from hospitals until response
- [ ] Hospital verification flag (`is_verified`) checked before SMS
- [ ] Anonymous auth rate limiting (Supabase default + app-level)
- [ ] VAPID keys for web push (not hardcoded)
- [ ] Edge Function secrets (Twilio, VAPID) in Supabase Vault