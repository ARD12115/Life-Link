# 🛠️ LifeLink Troubleshooting & Debugging Guide

This guide covers common issues and their solutions across the Hospital Web and Donor App workspaces.

---

## 🚨 Critical System Health
| Issue | Status | Fix |
| :--- | :--- | :--- |
| **Mapbox Token Error** | ✅ Fixed | The app now uses **MapLibre**. No token is required. |
| **Supabase Key Error** | ✅ Fixed | `supabase.js` now supports both `ANON_KEY` and `PUBLISHABLE_KEY`. |
| **Compilation Error** | ✅ Fixed | Downgraded to Mapbox GL v2.15.0 for Webpack compatibility. |
| **VAPID Key Error** | ✅ Fixed | Generated and added to `.env`. Check `VAPID_PUBLIC_KEY`. |

---

## 🔧 Environment Setup
> [!IMPORTANT]
> Ensure your `.env` file is located inside the `hospital_web/` folder for the website to work.

### Required Keys
```dotenv
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-key-here
REACT_APP_VAPID_PUBLIC_KEY=your-public-key
```

---

## 🗺️ Common Fixes

<details>
<summary><b>1. Maps not loading?</b></summary>

- Check if `maplibre-gl` is installed: `npm install maplibre-gl`.
- Verify you are not using a Mapbox `pk.xxx` token with the MapLibre component.
</details>

<details>
<summary><b>2. Notifications not working?</b></summary>

- Ensure you have clicked **"Enable Notifications"** in the browser.
- Check that the Service Worker is registered in Chrome: `chrome://serviceworker-internals/`.
- Verify VAPID keys in `.env`.
</details>

<details>
<summary><b>3. Anonymous Auth failing?</b></summary>

- Ensure "Anonymous Sign-ins" are enabled in your Supabase Auth dashboard.
- Check if `localStorage` is blocked by your browser.
</details>

---

## 🧪 Simulation Mode
If you don't have Twilio or real VAPID push working, use the **Simulation Mode**:
- **SMS**: Check the browser console (`F12`) after posting a request.
- **Push**: Click **"Send Test Push"** in the Donor Dashboard.
