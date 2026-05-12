# Troubleshooting

Common issues and fixes for the LifeLink application.

---

## Quick Diagnostics

Open the browser console (F12 → Console tab) and look for these indicators:

| Console output | Meaning |
|----------------|---------|
| `✅ Requests loaded: X` | Supabase connection working, data fetched |
| `📡 Realtime subscription status: SUBSCRIBED` | Real-time sync active |
| `❌ ...` | Something failed — read the error message |

If you see no console output at all, the app likely failed to start or the Supabase client is misconfigured.

---

## Connection Issues

### "Failed to fetch" or CORS error

**Cause:** Supabase URL or API key is invalid or missing.

**Fix:**

1. Open `.env` and verify:

   ```dotenv
   REACT_APP_SUPABASE_URL=https://<project-id>.supabase.co
   REACT_APP_SUPABASE_PUBLISHABLE_KEY=<anon-key>
   ```

2. Get fresh keys from **Supabase Dashboard → Settings → API**
3. Restart the dev server (`Ctrl+C` then `npm start`) — env changes require a restart

### "Table does not exist" error

**Cause:** Database schema has not been applied.

**Fix:**

1. Go to **Supabase Dashboard → SQL Editor → New Query**
2. Paste the entire contents of `supabase_schema.sql`
3. Click **Run**
4. Reload the app

### No data showing (Donors: 0, Hospitals: 0)

**Cause:** Tables exist but contain no records.

**Fix:** Insert test data via the SQL Editor. See [SUPABASE_SETUP_GUIDE.md → Seed Test Data](SUPABASE_SETUP_GUIDE.md#7-seed-test-data-optional).

---

## Authentication Issues

### Sign-in button does nothing

**Cause:** Usually a Supabase client misconfiguration.

**Fix:**

1. Check browser console for auth error messages
2. Verify `.env` has the correct Supabase URL and key
3. Ensure the Supabase project is active (not paused)

### "Email not confirmed" error

**Cause:** Email confirmation is enabled and the user hasn't clicked the confirmation link.

**Fix:**

1. Check your email inbox (including spam) for the Supabase confirmation email
2. Click the confirmation link
3. Then sign in again

**For local testing:** Disable email confirmation in **Supabase Dashboard → Authentication → Providers → Email → Confirm email → OFF**.

### Confirmation email not received

**Fix:**

1. Check spam/junk folders
2. Wait 2 minutes (emails can be slow)
3. Try a different email address
4. Verify **Email Auth** is enabled in Supabase Authentication settings

### Stuck on wrong role after logout

**Cause:** Your Supabase user still has a saved profile with the previous role.

**Fix:** This is expected behavior. The app persists role selection in the `profiles` table. If you need to test the other role, create a second account with a different email, or delete the profile row manually in the Supabase table editor.

---

## Real-time Issues

### Real-time not updating

**Cause:** Realtime is not enabled on the relevant tables.

**Fix:**

1. Go to **Supabase Dashboard → Database → Tables**
2. Click `blood_requests` → toggle **Realtime** to **ON** (top-right)
3. Repeat for `donor_responses`, `donors`, and `hospitals`
4. Wait 30 seconds, then reload the app

### Updates appear in console but not on screen

**Cause:** Component rendering issue, possibly stale cache.

**Fix:**

```bash
# Stop the dev server (Ctrl+C), then:
rm -r node_modules build
npm install
npm start

# In browser: Ctrl+Shift+Delete to clear cache
```

---

## Build Issues

### App won't start / "Cannot find module" errors

**Fix:**

```bash
rm -r node_modules package-lock.json
npm install
npm start
```

### Source map warnings

```text
Failed to parse source map from '@supabase/functions-js/src/...'
```

**Verdict:** ✅ Safe to ignore. The Supabase `functions-js` package references TypeScript source files that aren't bundled. The compiled JavaScript works correctly.

### Webpack deprecation warnings

```text
[DEP_WEBPACK_DEV_SERVER_ON_AFTER_SETUP_MIDDLEWARE] DeprecationWarning
```

**Verdict:** ✅ Safe to ignore. React Scripts uses older Webpack middleware options. This will be fixed in a future React Scripts update. The app compiles and runs normally.

---

## RLS Policy Issues

### "Policy already exists" error

**Verdict:** This should not happen because the schema uses `DO` blocks with exception handling. If it does occur, the policy is already applied — just reload the app.

### Infinite recursion in RLS policies

**Background:** This was a known issue with earlier policy definitions that cross-referenced the `profiles` table from `donors`/`hospitals` policies. The current schema uses simplified policies that avoid cross-table lookups.

**Fix:** Re-apply the current `supabase_schema.sql` which uses the corrected policies.

---

## UI Issues

### Theme not applying correctly

**Fix:**

1. Check that `ThemeContext.js` is wrapping the app (it's imported in `index.js`)
2. Try clicking the theme buttons in the top navigation bar (sun / moon / monitor icons)
3. Clear localStorage: open Console (F12) and run `localStorage.clear()`, then reload

### Page shows blank white screen

**Cause:** Usually a JavaScript error preventing React from rendering.

**Fix:**

1. Open Console (F12) and check for red error messages
2. Common causes: missing environment variables, network error to Supabase, or a component crash
3. Try the full reset below

---

## Full Reset

If nothing else works, start completely fresh:

```bash
# 1. Stop the dev server (Ctrl+C)

# 2. Clear everything
rm -r node_modules package-lock.json build

# 3. Reset environment
cp .env.example .env
# Fill in your Supabase URL and anon key

# 4. Reinstall and start
npm install
npm start

# 5. In browser: Ctrl+Shift+Delete to clear cache
```

If the database is also in a bad state, see the [Quick Reset section in SUPABASE_SETUP_GUIDE.md](SUPABASE_SETUP_GUIDE.md#quick-reset).

---

## Code Quality Notes

All core files have been reviewed and verified clean:

| File | Status | Notes |
|------|--------|-------|
| `App.jsx` | ✅ Clean | Proper auth state management, subscription cleanup |
| `Auth.jsx` | ✅ Clean | Email/password auth, `isMounted` guard, error handling |
| `LandingPage.jsx` | ✅ Clean | Static presentation, no side effects |
| `HospitalDashboard.jsx` | ✅ Clean | Request management, real-time sync |
| `DonorDashboard.jsx` | ✅ Clean | Alert handling, response management |
| `useDonors.js` | ✅ Clean | `isMounted` ref, channel cleanup, throttling |
| `useRequests.js` | ✅ Clean | `isMounted` ref, channel cleanup, throttling |
| `supabase.js` | ✅ Clean | Simple client init, no side effects |

---

## Still Stuck?

1. Read the error message in the browser console carefully
2. Search this document for keywords from the error
3. Check [SUPABASE_SETUP_GUIDE.md](SUPABASE_SETUP_GUIDE.md) for configuration steps
4. Check the [Supabase status page](https://status.supabase.com/) for outages
5. Open an issue on [GitHub](https://github.com/1LifeLink1/LifeLink/issues)
