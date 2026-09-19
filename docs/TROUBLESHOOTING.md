# 🛠️ LifeLink Troubleshooting & Debugging Guide

Real issues encountered during development and their verified fixes. Covers both Hospital Web (`hospital_web/`) and Donor App (`donor_app/`).

---

## 🚨 Critical System Health

| Issue | Status | Root Cause | Fix |
|-------|--------|------------|-----|
| **Mapbox Token Error** | ✅ Fixed | Code used `mapbox-gl` requiring token | Switched to `maplibre-gl` (no token) in `EmergencyMap.jsx` |
| **Supabase Key Naming** | ✅ Fixed | Env vars used `PUBLISHABLE_KEY` but code expected `ANON_KEY` | `supabase.js` now accepts both: `ANON_KEY \|\| PUBLISHABLE_KEY` |
| **Webpack 5 + Mapbox GL v3** | ✅ Fixed | `mapbox-gl` v3 incompatible with CRA webpack | Pinned `mapbox-gl@^2.15.0` OR use `maplibre-gl@^5.24.0` |
| **VAPID Key Missing** | ✅ Fixed | Web push needs VAPID public key | Generate: `npx web-push generate-vapid-keys` → add to `.env` |
| **Anonymous Auth Fails** | ✅ Fixed | Supabase default: anonymous disabled | Enable in Dashboard → Auth → Providers → Anonymous |
| **Expo Go Push Crash** | ✅ Fixed | Expo SDK 53+ removed push from Expo Go | `usePushNotifications.ts` guards with `isExpoGo` check |

---

## 🔧 Environment Setup

### Required `.env` Files

**hospital_web/.env**
```dotenv
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
REACT_APP_VAPID_PUBLIC_KEY=your-vapid-public-key
REACT_APP_EXPO_URL=exp://your-lan-ip:8081  # Auto-set by npm start
```

**donor_app/.env**
```dotenv
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Common Env Mistakes
| Mistake | Symptom | Fix |
|---------|---------|-----|
| `.env` in root instead of app folder | `process.env.REACT_APP_*` undefined | Must be in `hospital_web/` and `donor_app/` |
| Using `PUBLISHABLE_KEY` only | Web works, mobile fails | Mobile expects `ANON_KEY`; code handles both |
| Missing `EXPO_PUBLIC_` prefix | Donor app can't read vars | Expo only exposes `EXPO_PUBLIC_*` to client |
| VAPID key in donor_app | Web push fails | VAPID only needed for web (`hospital_web`) |

---

## 🗺️ Maps Issues

<details>
<summary><b>1. Maps not loading (white/gray screen)</b></summary>

**Causes & Fixes:**
- **Wrong library**: Ensure `maplibre-gl` imported, not `mapbox-gl`
  ```javascript
  // EmergencyMap.jsx
  import maplibregl from 'maplibre-gl'  // ✅ Correct
  // import mapboxgl from 'mapbox-gl'   // ❌ Needs token
  ```
- **CSS missing**: MapLibre needs its CSS
  ```javascript
  // In EmergencyMap.jsx or index.js
  import 'maplibre-gl/dist/maplibre-gl.css'
  ```
- **Container size**: Map container must have explicit height
  ```css
  .map-container { height: 500px; width: 100%; }  /* Not 0 height */
  ```
- **Coordinates null**: Donors/hospitals without lat/lng won't appear
  - Check `latitude`/`longitude` columns in DB
  - Onboarding captures GPS; fallback to city-only if denied
</details>

<details>
<summary><b>2. Donor markers show wrong location</b></summary>

**Expected Behavior:** Markers are **intentionally jittered ±200m** for privacy.

**Verification:**
```javascript
// In EmergencyMap.jsx - processedDonors pattern
const processedDonors = donors.map(d => ({
  ...d,
  latitude: d.latitude + (Math.random() - 0.5) * 0.004,  // ~200m
  longitude: d.longitude + (Math.random() - 0.5) * 0.004
}))
```
- This is a **feature**, not a bug — protects donor home addresses
- Zoom in to see the jitter; it's by design
</details>

<details>
<summary><b>3. MapLibre GL "Container not found" error</b></summary>

**Cause:** Rendering before DOM ready or container unmounted.

**Fix:**
```javascript
// EmergencyMap.jsx
useEffect(() => {
  if (!mapContainer.current) return
  const map = new maplibregl.Map({ container: mapContainer.current, ... })
  return () => map.remove()  // Cleanup on unmount
}, [])
```
</details>

---

## 🔔 Notifications Issues

<details>
<summary><b>1. Web Push "Enable Notifications" button does nothing</b></summary>

**Checklist:**
- [ ] `REACT_APP_VAPID_PUBLIC_KEY` set in `hospital_web/.env`
- [ ] Service Worker registered: `navigator.serviceWorker.register('/sw.js')`
- [ ] HTTPS or localhost (required for Push API)
- [ ] Browser permission not blocked: `chrome://settings/content/notifications`
- [ ] Check console for: `"✅ Push subscription saved to cloud"`

**Debug:**
```javascript
// In browser console
Notification.permission  // Should be "granted"
navigator.serviceWorker.ready.then(reg => reg.pushManager.getSubscription())
```
</details>

<details>
<summary><b>2. Donor App: Push notifications not received</b></summary>

**Expo Go Limitations:**
- Push **does not work in Expo Go** (SDK 53+)
- `usePushNotifications.ts` detects this and logs: `"Bypassing Push Token registration in Expo Go"`

**For Real Testing:**
```bash
# Build development client (includes push)
npx expo install expo-dev-client
npx expo run:ios  # or :android
# OR use EAS Build
eas build --profile development --platform ios
```

**Production Checklist:**
- [ ] `google-services.json` (Android) / `GoogleService-Info.plist` (iOS) in project
- [ ] EAS Build with `expo-notifications` plugin configured
- [ ] FCM/APNs keys in Expo dashboard (or let Expo manage)
- [ ] Test with `eas build --profile preview` → install on device
</details>

<details>
<summary><b>3. "Simulate Emergency Alert" button does nothing (Donor App)</b></summary>

**Cause:** `Notifications.scheduleNotificationAsync` requires permissions.

**Fix:**
```typescript
// In usePushNotifications.ts - ensure handler set
if (!isExpoGo) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  })
}
```
- Button in `DonorDashboard.tsx` calls this directly
- Works in dev client and standalone builds
- In Expo Go: shows alert but no system notification (expected)
</details>

---

## 🔐 Authentication Issues

<details>
<summary><b>1. "Invalid login credentials" on anonymous sign-in</b></summary>

**Cause:** Anonymous provider disabled in Supabase.

**Fix:**
1. Supabase Dashboard → Authentication → Providers
2. Enable **Anonymous Sign-ins**
3. Save

**Verify:**
```sql
-- In Supabase SQL Editor
SELECT * FROM auth.users WHERE is_anonymous = true;
```
</details>

<details>
<summary><b>2. Hospital registration fails silently</b></summary>

**Common Causes:**
- **RLS Policy**: `hospitals` insert policy requires `auth.uid() = user_id`
  - Ensure user is authenticated before insert
  - Check `useEffect` in `HospitalDashboard.jsx` loads profile first
- **Missing Columns**: Form submits `latitude`/`longitude` but columns may not exist
  - Run `supabase_schema.sql` to ensure schema is current
- **Geolocation Rejected**: Browser blocks GPS
  - Code handles this gracefully (lat/lng = null, proceeds with city)
  - Check console: `"📡 Geolocation failed, proceeding with city only"`

**Debug:**
```javascript
// In HospitalDashboard.jsx onSubmit handler
console.log('Form data:', Object.fromEntries(fd))
console.log('User:', user)
console.log('Coords:', lat, lng)
```
</details>

<details>
<summary><b>3. Donor onboarding creates profile but not donor record</b></summary>

**Cause:** Atomic insert sequence fails at step 2.

**Code Flow** (`useDonorAuth.ts`):
```typescript
// 1. Insert profile
const { error: profileError } = await supabase
  .from('profiles').insert({ user_id, role: 'donor', ... })

// 2. Insert donor
const { data: donorData, error: donorError } = await supabase
  .from('donors').insert({ user_id, name, blood_group, city, phone, available: true })
```

**Fix:**
- Check `profiles` RLS: `auth.uid() = user_id` with check
- Check `donors` RLS: same policy
- Ensure `user_id` matches authenticated user (anonymous user has valid UUID)
- Duplicate profile error (code `23505`) handled: returns "Profile already exists"
</details>

---

## ⚡ Real-time Sync Issues

<details>
<summary><b>1. Hospital creates request → Donor app doesn't update</b></summary>

**Checklist:**
- [ ] Replication enabled: Dashboard → Database → Replication → `blood_requests` ✅
- [ ] Donor app `useRequests` hook subscribes to `postgres_changes`
- [ ] Blood group matches: Donor's `blood_group` = Request's `blood_group`
- [ ] Request status = `'open'` (hook filters `.eq('status', 'open')`)
- [ ] Channel name unique: `requests_realtime_${random}` prevents conflicts

**Debug:**
```typescript
// In donor_app/hooks/useRequests.ts - add logging
.on('postgres_changes', { event: '*', schema: 'public', table: 'blood_requests' }, (payload) => {
  console.log('📡 Realtime payload:', payload)
  // ...
})
```
</details>

<details>
<summary><b>2. Duplicate requests appearing in Hospital dashboard</b></summary>

**Cause:** Optimistic update + realtime INSERT both add same request.

**Fix in `useRequests.js`:**
```javascript
// On INSERT: force refetch (handles complex joins)
if (payload.eventType === 'INSERT') fetchRequests(true)

// On UPDATE: patch local state (no refetch)
if (payload.eventType === 'UPDATE') {
  setRequests(prev => prev.map(r => r.id === payload.new.id ? { ...r, ...payload.new } : r))
}
```
- INSERT triggers full refetch to get joined `hospitals` + `donor_responses`
- UPDATE patches locally for instant feedback
</details>

<details>
<summary><b>3. Memory leak: "Can't perform a React state update on an unmounted component"</b></summary>

**Cause:** Subscription not cleaned up.

**Pattern Used (All Hooks):**
```javascript
useEffect(() => {
  isMounted.current = true
  // ... fetch ...

  const channel = supabase.channel(...).subscribe()

  return () => {
    isMounted.current = false
    supabase.removeChannel(channel)  // ✅ Critical cleanup
  }
}, [dependencies])
```
- `isMounted` ref guards `setState` after unmount
- `supabase.removeChannel(channel)` prevents orphaned subscriptions
</details>

---

## 📱 Donor App Specific Issues

<details>
<summary><b>1. "Module not found: expo-secure-store"</b></summary>

**Fix:**
```bash
cd donor_app
npx expo install expo-secure-store
# OR
npm install expo-secure-store
```
- Required for `ExpoSecureStoreAdapter` in `lib/supabase.ts`
</details>

<details>
<summary><b>2. TypeScript errors on `supabase` imports</b></summary>

**Cause:** `@supabase/supabase-js` types not installed.

**Fix:**
```bash
cd donor_app
npm install -D @types/supabase__supabase-js
# Or use the types bundled in supabase-js v2+
```
- Current code uses `any` for quick dev; replace with generated types:
```bash
npx supabase gen types typescript --project-id hqdiqjswknukqyghtgsa > types/supabase.ts
```
</details>

<details>
<summary><b>3. Metro bundler cache issues</b></summary>

**Symptoms:** Old code running, strange errors after pull.

**Fix:**
```bash
cd donor_app
npx expo start -c  # Clear cache
# OR
rm -rf node_modules/.cache
```
</details>

<details>
<summary><b>4. iOS Simulator: "Could not find device"</b></summary>

**Fix:**
```bash
# List available simulators
xcrun simctl list devices

# Boot one
xcrun simctl boot "iPhone 16"

# Then
npx expo run:ios
```
</details>

---

## 🏥 Hospital Web Specific Issues

<details>
<summary><b>1. "Module not found: @supabase/ssr" or "next/headers"</b></summary>

**Cause:** Following Next.js tutorials — LifeLink is **CRA (Create React App)**, not Next.js.

**Fix:** Do NOT install `@supabase/ssr`. Use existing pattern:
```javascript
// hospital_web/src/lib/supabase.js
import { createClient } from '@supabase/supabase-js'
export const supabase = createClient(url, key)
```
- No middleware, no server components, no `cookies()` from `next/headers`
</details>

<details>
<summary><b>2. CRA Webpack 5 + MapLibre CSS not loading</b></summary>

**Fix:** Import CSS in component that uses map:
```javascript
// EmergencyMap.jsx
import 'maplibre-gl/dist/maplibre-gl.css'
```
- CRA doesn't auto-import from `node_modules` for CSS
</details>

<details>
<summary><b>3. QR Code on landing page shows "Waiting for network discovery"</b></summary>

**Cause:** `REACT_APP_EXPO_URL` not set or script failed.

**Fix:**
```bash
# Script auto-runs on npm start
npm start
# Check scripts/get-ip.js - detects LAN IP and writes to hospital_web/.env.local
```
- `.env.local` is gitignored; generated fresh each start
- Fallback: manually set `REACT_APP_EXPO_URL=exp://192.168.x.x:8081`
</details>

---

## 🗄️ Database & RLS Issues

<details>
<summary><b>1. "Row-level security policy violation" on SELECT</b></summary>

**Cause:** Query violates RLS policy for current user role.

**Common Scenarios:**
| Query | Required Role | Policy |
|-------|---------------|--------|
| `donors.select('*')` | Hospital (verified) | `hospitals_read_basic_donors` |
| `donors.select('phone')` | Hospital + donor responded | Phone only via join on `donor_responses` |
| `blood_requests.insert()` | Hospital (owner) | `hospitals_manage_requests` |
| `donor_responses.update()` | Donor (owner) or Hospital (request owner) | `donors_manage_responses` / `hospitals_manage_responses` |

**Debug:**
```sql
-- In Supabase SQL Editor - test as specific user
SET ROLE authenticated;
SET request.jwt.claims = '{"sub": "user-uuid-here"}';
SELECT * FROM donors;  -- Should return only allowed rows
```
</details>

<details>
<summary><b>2. Realtime not receiving INSERT events</b></summary>

**Cause:** Replication not enabled for table.

**Fix:**
1. Dashboard → Database → Replication
2. Find `blood_requests`, `donor_responses`, `donors`
3. Toggle **Enable** for each
4. Wait ~30 seconds for propagation
</details>

<details>
<summary><b>3. Edge Function "Function not found" or 401</b></summary>

**Cause:** Function not deployed or secrets missing.

**Fix:**
```bash
cd hospital_web
supabase functions deploy send-blood-alert
# Then in Dashboard → Edge Functions → Secrets:
# TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER, VAPID_PRIVATE_KEY
```

**Simulation Mode:** If function fails, UI logs mock alert — check browser console for:
```
💡 [MOCK ALERT] An emergency SMS would have been sent to matching B+ donors in Mumbai.
```
</details>

---

## 🧪 Simulation Mode (No External Services)

Use these when Twilio, VAPID, or Maps aren't configured:

| Feature | How to Test |
|---------|-------------|
| **SMS Alerts** | Create Critical request → Check browser console (F12) for `[MOCK ALERT]` |
| **Web Push** | Hospital Dashboard → "Enable Desktop Alerts" → Allow → "Send Test Push" in Donor Hub |
| **Native Push** | Donor App → "Simulate Emergency Alert" button |
| **Map Privacy** | Zoom into donor marker → observe ±200m jitter |
| **Real-time Sync** | Open both apps side-by-side → Create request → Appears in <1s |

---

## 🔍 Debugging Commands

```bash
# Verify Supabase connection
cd hospital_web && node -e "require('dotenv').config(); const {createClient}=require('@supabase/supabase-js'); const s=createClient(process.env.REACT_APP_SUPABASE_URL, process.env.REACT_APP_SUPABASE_ANON_KEY); s.from('hospitals').select('*').then(console.log)"

# Check donor_app TypeScript
cd donor_app && npx tsc --noEmit

# Clear all caches
cd hospital_web && rm -rf node_modules/.cache
cd ../donor_app && rm -rf node_modules/.cache && npx expo start -c

# Reinstall everything
cd C:/LifeLink && rm -rf node_modules hospital_web/node_modules donor_app/node_modules && npm run install-all
```

---

## 📞 When All Else Fails

1. **Check Supabase Logs** → Dashboard → Logs → Database / Auth / Edge Functions
2. **Browser Console** → Network tab → Filter "supabase" → Look for 400/401/500
3. **React DevTools** → Components → Check props/state on `HospitalDashboard` / `DonorDashboard`
4. **Expo Logs** → `npx expo start` → Terminal output shows Metro + device logs
5. **Git History** → `git log --oneline -20` → Recent changes may have introduced regression

---

## 📋 Quick Reference: Most Common Fixes

| Problem | 30-Second Fix |
|---------|---------------|
| Anonymous auth fails | Enable Anonymous provider in Supabase Auth |
| Maps white screen | Use `maplibre-gl` + import its CSS |
| Push not working (web) | Set `REACT_APP_VAPID_PUBLIC_KEY` + allow browser permission |
| Push not working (mobile) | Build dev client (`npx expo run:ios/android`), not Expo Go |
| Realtime not syncing | Enable Replication for `blood_requests`, `donor_responses`, `donors` |
| Phone not visible | Hospital must be verified + donor must have `confirmed` response |
| Env vars undefined | `.env` must be in `hospital_web/` AND `donor_app/` (not root) |
| TypeScript errors | Run `npx tsc --noEmit` in `donor_app/` to see real errors |