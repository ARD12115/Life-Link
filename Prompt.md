# Project Prompt Context

Use this context to bring AI assistants up to speed on the LifeLink codebase.

## 🩸 LifeLink — Project Context

**Status**: Production-ready security hardening with a premium UI overhaul.

### Tech Stack
- **Frontend**: React 18 + Create React App
- **Routing**: React Router DOM (LandingPage, Hospital Portal, Donor Portal)
- **Backend**: Supabase (Auth, PostgreSQL, Realtime)
- **Styling**: Vanilla CSS with a global design system (`index.css`) and dark/light/system theme support
- **Realtime**: Active subscriptions on `blood_requests` and `donor_responses`
- **Notifications**: Dual-channel alerts via Twilio (SMS) and Web Push API (Service Worker)
- **Maps**: Mapbox-powered visualization of donors and active hospital emergencies

### Core Architecture
- **Landing Page**: entry point for both portals.
- **Hospital Portal (`/hospital`)**: Auth-gated dashboard for creating requests and managing donor responses.
- **Real-time Engine**: Optimized hook `useRequests.js` that patches local state with Postgres payload for instant updates.
- **Background Alerts**: Service Worker (`sw.js`) and Web Push API with VAPID key decoding.
- **Geospatial Intelligence**: `EmergencyMap.jsx` with Mapbox integration, automatic geolocation capture, and anonymized donor density views.
- **Centralized Auth**: `App.jsx` handles anonymous donor sessions to prevent race conditions.
- **Security**: Row-Level Security (RLS) enabled on all tables, enforcing role-based access.

### Database Schema
- `profiles`: User roles (`hospital` | `donor`) and display names.
- `donors`: Name, blood group, city, availability, and donation history.
- `hospitals`: Facility name, city, contact person, and phone.
- `blood_requests`: Hospital ID, blood group, units, urgency, and status (`open`, `in_progress`, etc.).
- `donor_responses`: Request ID, Donor ID, and status (`alerted`, `confirmed`, etc.).

### Frontend Structure
- `App.jsx`: Main router, centralized auth, and top-nav layout.
- `public/sw.js`: Service Worker for background push notifications.
- `components/EmergencyMap.jsx`: Real-time Mapbox visualization with anonymized donor jitter.
- `components/VisualEnvironment.jsx`: Parallax background with 3D effects.
- `context/ThemeContext.js`: Global theme management.
- `hooks/useNotifications.js`: Web Push permission and VAPID subscription logic.
- `hooks/useRequests.js`: Optimized real-time blood request synchronization (state patching).
- `hooks/useDonors.js`: Real-time donor and hospital data fetching.

### Development Utilities
- `lib/supabaseDebug.js`: Connection diagnostic tool.
- `components/DebugDashboard.jsx`: Developer-only diagnostics panel.
- `scripts/setup.js`: Automated project initialization.

### Environment Variables Required
```dotenv
REACT_APP_SUPABASE_URL=https://<project-id>.supabase.co
REACT_APP_SUPABASE_PUBLISHABLE_KEY=<anon-key>
```

---
**Note**: This file is intended for AI context only. Do not store sensitive credentials here.
