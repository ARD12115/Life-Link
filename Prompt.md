# Project Prompt Context

Use this context to bring AI assistants up to speed on the LifeLink codebase.

## 🩸 LifeLink — Project Context

**Status**: Production-ready security hardening with a premium UI overhaul.

### Tech Stack
- **Frontend**: React 18 + Create React App
- **Routing**: React Router DOM (LandingPage, Hospital Portal, Donor Portal)
- **Backend**: Supabase (Auth, PostgreSQL, Realtime)
- **Styling**: Vanilla CSS with a global design system (`index.css`) and dark/light/system theme support
- **Icons**: Lucide React
- **Realtime**: Active subscriptions on `blood_requests` and `donor_responses`

### Core Architecture
- **Landing Page**: entry point for both portals.
- **Hospital Portal (`/hospital`)**: Auth-gated dashboard for creating requests and managing donor responses.
- **Donor Portal (`/donor`)**: Open-access dashboard for viewing alerts and responding to requests.
- **Authentication**: Standard Email/Password (Magic Links disabled).
- **Security**: Row-Level Security (RLS) enabled on all tables, enforcing role-based access.

### Database Schema
- `profiles`: User roles (`hospital` | `donor`) and display names.
- `donors`: Name, blood group, city, availability, and donation history.
- `hospitals`: Facility name, city, contact person, and phone.
- `blood_requests`: Hospital ID, blood group, units, urgency, and status (`open`, `in_progress`, etc.).
- `donor_responses`: Request ID, Donor ID, and status (`alerted`, `confirmed`, etc.).

### Frontend Structure
- `App.jsx`: Main router and top-nav layout.
- `components/VisualEnvironment.jsx`: Parallax background with 3D effects.
- `context/ThemeContext.js`: Global theme management.
- `hooks/useRequests.js`: Real-time blood request synchronization.
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
