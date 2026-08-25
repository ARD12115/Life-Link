# 🧠 LifeLink Developer Skill Guidelines

Best practices, patterns, and conventions for the LifeLink monorepo. Based on actual implemented code.

---

## 🎨 Design System

### Web (`hospital_web/src/index.css`)
```css
:root {
  /* Core */
  --bg-app: #0d0d0d;
  --bg-card: rgba(22, 22, 22, 0.9);
  --border-soft: rgba(255, 255, 255, 0.08);
  --text-main: #f5f5f5;
  --text-muted: #a0a0a0;

  /* Accents (semantic) */
  --accent-red: #ff2d55;      /* Critical, blood, danger */
  --accent-blue: #007aff;     /* Primary actions, hospitals */
  --accent-green: #34c759;    /* Success, confirmed, lives saved */
  --accent-orange: #ff9f0a;   /* Warning, in-progress */

  /* Glassmorphism */
  --glass-bg: rgba(255, 255, 255, 0.04);
  --glass-border: rgba(255, 255, 255, 0.1);
  --glass-blur: blur(16px);
}

/* Utility classes used throughout */
.ui-panel { background: var(--bg-card); border: 1px solid var(--border-soft); border-radius: 16px; backdrop-filter: var(--glass-blur); }
.btn-solid { background: var(--accent-red); color: white; border: none; border-radius: 12px; font-weight: 700; }
.btn-ghost { background: transparent; color: var(--text-main); border: 1px solid var(--border-soft); border-radius: 12px; }
.blood-tag { background: rgba(255, 45, 85, 0.15); color: var(--accent-red); border: 1px solid rgba(255, 45, 85, 0.3); border-radius: 8px; padding: 4px 12px; font-weight: 800; font-size: 13px; }
.fade-in { animation: fadeIn 0.3s ease-out; }
```

### Mobile (`donor_app/theme/`)
- Mirror web colors in `Theme.colors` object
- Use `StyleSheet.create()` — no inline styles in render
- High contrast for sunlight/emergency visibility
- Dark mode: `useColorScheme()` + `Theme.colors` switching

---

## ⚡ Real-time Patterns (Critical)

### ✅ DO: Optimistic Updates + Subscription Patch
```javascript
// useRequests.js pattern
const { requests, mutateRequests, refetch } = useRequests()

// 1. Optimistic insert
mutateRequests(prev => [{ ...newRequest, hospitals: myHospital }, ...prev])

// 2. Subscription handles server confirmation
useEffect(() => {
  const channel = supabase.channel('unique_name')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'blood_requests' }, (payload) => {
      if (payload.eventType === 'INSERT') refetch(true)  // Full refetch for joins
      if (payload.eventType === 'UPDATE') setRequests(prev => prev.map(r => r.id === payload.new.id ? { ...r, ...payload.new } : r))
      if (payload.eventType === 'DELETE') setRequests(prev => prev.filter(r => r.id !== payload.old.id))
    })
    .subscribe()
  return () => supabase.removeChannel(channel)
}, [refetch])
```

### ❌ DON'T: Poll or Full Refetch on Every Change
```javascript
// BAD - causes flicker, race conditions, network storms
setInterval(() => fetchRequests(), 5000)
// BAD - refetch on every keystroke
onChange={async () => { await fetchRequests(); setState(...) }}
```

### Subscription Rules
1. **Unique channel names**: `table_realtime_${Math.random().toString(36).substring(7)}`
2. **Cleanup in return**: `supabase.removeChannel(channel)` — prevents memory leaks
3. **Guard with `isMounted` ref**: Prevents state updates on unmounted components
4. **Throttle manual refetch**: `lastFetchTime` ref (1s minimum)

---

## 🛡️ Security First

### RLS Awareness
```javascript
// NEVER trust client-side checks
// BAD:
if (user.role === 'hospital') { showPhoneNumber() }

// GOOD: RLS enforces this in database
// Policy: donors phone only visible if hospital has confirmed response
```

### Data Minimization
```javascript
// GOOD: Select only needed columns
.select('id, name, blood_group, city, available, latitude, longitude')

// BAD: Select all (exposes phone, last_donated, total_donations)
.select('*')
```

### Privacy Patterns
```javascript
// Map jitter — applied BEFORE render, never stored
const processedDonors = donors.map(d => ({
  ...d,
  latitude: d.latitude + (Math.random() - 0.5) * 0.004,  // ±200m
  longitude: d.longitude + (Math.random() - 0.5) * 0.004
}))

// Console logging — NEVER log PII in production
console.log('Donor matched:', { id: donor.id, bloodGroup: donor.blood_group })  // ✅ Safe
console.log('Donor matched:', donor)  // ❌ Exposes phone, name, coordinates
```

---

## 📱 Mobile-Specific Rules (Donor App)

### Offline First
- **SecureStore** for session tokens (hardware-encrypted)
- **Supabase auto-refresh** handles reconnection
- **Optimistic UI** works without network; syncs when online

```typescript
// lib/supabase.ts - SecureStore adapter
const ExpoSecureStoreAdapter = {
  getItem: (key) => SecureStore.getItemAsync(key),
  setItem: (key, value) => SecureStore.setItemAsync(key, value),
  removeItem: (key) => SecureStore.deleteItemAsync(key),
}

// AppState listener for battery optimization
AppState.addEventListener('change', (state) => {
  if (state === 'active') supabase.auth.startAutoRefresh()
  else supabase.auth.stopAutoRefresh()
})
```

### Battery Life
- **Background location ONLY when `available === true`**
- **Geofencing** over continuous GPS
- **Push notifications** replace polling

### Touch Targets
```typescript
// Minimum 44x44 points
<TouchableOpacity style={{ minHeight: 44, minWidth: 44, justifyContent: 'center', alignItems: 'center' }}>
  <Text>Action</Text>
</TouchableOpacity>

// Glove-friendly unit controls (HospitalDashboard.jsx)
<div style={{ height: '52px' }}>  // Large hit area
  <button>-</button> <span>{units}</span> <button>+</button>
</div>
```

### TypeScript
- **Strict mode enabled** in `tsconfig.json`
- **Generate Supabase types**:
  ```bash
  npx supabase gen types typescript --project-id hqdiqjswknukqyghtgsa > types/supabase.ts
  ```
- **Avoid `any`** — use generated `Database` types

---

## 🔄 Code Organization

### Hooks (Single Responsibility)
```
hospital_web/src/hooks/
├── useRequests.js      # Blood requests + realtime
├── useDonors.js        # Donors + hospitals + realtime
├── useNotifications.js # Web Push + VAPID
└── useAdmin.js         # Admin role check

donor_app/hooks/
├── useDonorAuth.ts     # Anonymous auth + profile
├── useRequests.ts      # Filtered requests + realtime
├── usePushNotifications.ts # Expo Push + token save
└── useDonors.ts        # Donors + hospitals (map data)
```

### Shared Logic
```javascript
// hospital_web/src/lib/bloodLogic.js — single source of truth
export const COMPATIBILITY_MAP = { ... }
export function getCompatibleDonorGroups(targetBloodGroup) { ... }

// Used by BOTH apps — keep in sync
```

### Components
- **Smart components** (data + UI): `HospitalDashboard`, `DonorDashboard`
- **Dumb components** (UI only): `AlertCard`, `CardSkeleton`, `EmergencyMap`
- **Modals as components**: `NewRequestModal` (co-located in parent file)

---

## 🧪 Testing Patterns

### Simulation Mode (Zero External Deps)
```javascript
// Edge Function simulation
if (funcError) {
  console.warn('📡 Simulation Mode: Edge function trigger failed')
  console.log(`💡 [MOCK ALERT] Emergency SMS would be sent to ${bloodGroup} donors in ${city}`)
}

// Test push button
const sendTestPush = async () => {
  await Notifications.scheduleNotificationAsync({
    content: { title: "🩸 LifeLink Emergency", body: `URGENT: ${bloodGroup} needed!` },
    trigger: null  // Immediate
  })
}
```

### Real-time Testing
```bash
# Terminal 1: Hospital Web
cd hospital_web && npm start

# Terminal 2: Donor App
cd donor_app && npx expo start

# Test: Create request in Hospital → Instant in Donor
```

---

## 📦 Performance

### Web
- **Code splitting**: `React.lazy` for heavy tabs (Map, Directory)
- **Memoization**: `useMemo` for filtered lists (`activeRequests`, `myResponses`)
- **Virtualization**: Not yet needed (<100 items), but `react-window` ready

### Mobile
- **FlatList** for long lists (Directory)
- **Reanimated 4** for animations (runs on UI thread)
- **Image optimization**: `expo-image` for cached, progressive loading

---

## 🚫 Anti-Patterns (Code Review Will Reject)

| Anti-Pattern | Why | Alternative |
|--------------|-----|-------------|
| `supabase.from('table').select('*')` | Exposes all columns | Select specific columns |
| `setInterval(fetch, 5000)` | Polling wastes battery | Realtime subscriptions |
| `console.log(user)` | PII in logs | `console.log({ id: user.id, role: user.role })` |
| Inline styles in React Native | No reuse, hard to theme | `StyleSheet.create()` + Theme |
| `any` types in TypeScript | Loses type safety | Generated Supabase types |
| No `supabase.removeChannel()` | Memory leaks | Cleanup in `useEffect` return |
| Hardcoded colors | Breaks dark mode | Theme variables / `Theme.colors` |

---

## 🔧 Useful Commands

```bash
# Type check (donor_app)
cd donor_app && npx tsc --noEmit

# Generate Supabase types
npx supabase gen types typescript --project-id hqdiqjswknukqyghtgsa > donor_app/types/supabase.ts

# Lint (web)
cd hospital_web && npm run lint  # if markdownlint configured

# Clear caches
cd hospital_web && rm -rf node_modules/.cache
cd ../donor_app && rm -rf node_modules/.cache && npx expo start -c

# Full reinstall
cd C:/LifeLink && rm -rf node_modules hospital_web/node_modules donor_app/node_modules && npm run install-all
```

---

## 📚 Essential Reading Order

1. **README.md** — Architecture & quick start
2. **SUPABASE_SETUP_GUIDE.md** — Database, Auth, Edge Functions
3. **FEATURES_WALKTHROUGH.md** — Complete feature inventory
4. **MOBILE_STRATEGY_PLAN.md** — Platform decisions & roadmap
5. **TROUBLESHOOTING.md** — Known issues & fixes
6. **SECURITY_PENTEST_REPORT.md** — Security posture
7. This file — Code patterns & conventions

---

**Write code that saves lives. 🩸**