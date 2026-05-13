# Developer Guidelines

Guidelines for developing and maintaining the LifeLink codebase.

## Recent Architectural Updates (May 2026)
- **Landing Page & Routing**: Implemented `LandingPage.jsx` and `react-router-dom` for distinct `/hospital` and `/donor` paths.
- **Top Navigation Bar**: Replaced floating nav with a premium top-nav bar featuring theme controls and sign-out.
- **Theme System**: Added `ThemeContext` supporting Light, Dark, and System modes with smooth CSS transitions.
- **Visual Overhaul**: Integrated `VisualEnvironment.jsx` for 3D parallax background effects.
- **Auth Hardening**: Standardized on Email/Password authentication; Magic Links disabled for hospital security.
- **Background Alerts**: Added Web Push (Service Worker) and Twilio (SMS) for multi-channel emergency notifications.
- **Geospatial Features**: Integrated Mapbox and automatic Geolocation capture for real-time network visualization.

## Purpose
- Track code changes and integration fixes immediately.
- Maintain consistent styling using the global design system in `index.css`.
- Ensure all real-time subscriptions are cleaned up on unmount using `isMounted` refs.

## Documentation Workflow
Update the following docs whenever code changes:
- `README.md`: Overview and architecture.
- `CONTRIBUTING.md`: Detailed developer conventions.
- `SUPABASE_SETUP_GUIDE.md`: Schema or auth changes.
- `TROUBLESHOOTING.md`: New known issues or fixes.
- `Prompt.md`: AI context updates.

## Console Patterns
Use the established emoji prefixes for logs:
- ✅ Success
- ❌ Error
- 📡 Network
- 🔄 Real-time
- 👥 Donor
- 🏥 Hospital

## Launch Checklist
- [ ] App compiles without errors.
- [ ] Real-time sync works in two side-by-side tabs.
- [ ] Theme transitions are smooth across all components.
- [ ] Auth flow (sign up/sign in) verified.
- [ ] `npm run build` succeeds.
