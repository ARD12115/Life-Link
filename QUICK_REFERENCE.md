# 🎯 Quick Reference — LifeLink

## 🟢 Status Indicators
- **Console**: Look for `✅` and `📡 Realtime status: SUBSCRIBED`.
- **Notifications**: Check for `✅ Service Worker registered` in the console.
- **Maps**: Markers should pulse red during active emergency requests.
- **Theme**: Sun/Moon/Monitor icons in top-nav should switch modes instantly.

## 🚀 Common Commands
- `npm start`: Launch development server.
- `npm run build`: Create production bundle.
- `localStorage.clear()`: Run in console if theme or session gets stuck.

## 📁 Core File Map
| File | Role |
|------|------|
| `App.jsx` | Router, top-nav, and auth state. |
| `LandingPage.jsx` | Portal entry point and "How it works". |
| `HospitalDashboard.jsx` | Hospital staff request management. |
| `DonorDashboard.jsx` | Donor alert and response view. |
| `VisualEnvironment.jsx` | Global 3D background effect. |
| `index.css` | Design system and theme tokens. |

## 🔗 Supabase Links
- **Settings**: `https://app.supabase.com/project/[id]/settings/api`
- **Tables**: `https://app.supabase.com/project/[id]/editor`
- **Auth**: `https://app.supabase.com/project/[id]/auth/users`

## 🔴 Trouble Signs
| Message | Fix |
|---------|-----|
| `Failed to fetch` | Check `.env` keys and internet. |
| `Table not found` | Run `supabase_schema.sql` in SQL Editor. |
| `No real-time` | Enable "Realtime" toggle on tables in Supabase. |
| `Blank screen` | Check console for JS crashes. |
