Summary Prompt for Future Conversations
Use this prompt in your next AI conversation to continue work on this project:

LIFELINK PROJECT CONTEXT — Secure Production-Ready Blood Donation App
Project Status: Prototype with production-ready security hardening completed.

Tech Stack:

Frontend: React 18 + Create React App
Backend: Supabase (hosted at https://[YOUR-PROJECT-ID].supabase.co)
ORM: Prisma 5.17.0 (installed, optional for future backend)
Auth: Supabase email/password authentication (magic link disabled)
Database: PostgreSQL via Supabase
Realtime: Supabase Realtime on blood_requests and donor_responses tables
Database Schema:

profiles — User roles (hospital | donor) + metadata
donors — Name, blood group, city, availability, donation history
hospitals — Name, city, contact person, phone
blood_requests — Hospital requests with blood group, component, urgency, status
donor_responses — Donor reactions to requests (alerted, confirmed, declined, donated)
Security Features Implemented:

Row-level security (RLS) enabled on all tables
Role-based access control (hospital vs donor)
Authenticated-only data access
Email/password authentication with sign up/sign in
RLS policies simplified to prevent infinite recursion
Switch Role functionality for testing both roles
MCP server configured for enhanced development
Agent skills installed for Supabase best practices
Database connection setup with postgres package
Frontend Components:

Auth.jsx — Email/password login with sign up/sign in toggle
RoleSelector.jsx — Onboarding screen to choose hospital or donor role
HospitalDashboard.jsx — Hospital staff: create blood requests, manage responses, view donor alerts, Switch Role button
DonorDashboard.jsx — Donors: receive alerts, respond to requests, update availability, Switch Role button
SupabaseDropdowns.jsx — Example dropdowns showing donor/hospital lists from database
DebugDashboard.jsx — Development-only debugging utilities
Frontend State Management:

App.jsx loads profiles on auth, routes based on role
useDonors() hook with realtime updates
useRequests() hook with realtime subscriptions
useTheme() context for light/dark mode
Git Status:

Repository: https://github.com/1LifeLink1/LifeLink.git
Latest commit: "feat: Add secure Supabase integration with role-based auth, profiles table, RLS policies..."
.gitignore configured to exclude: .env, .env.local, build/, .supabase/, node_modules/
Remote: origin → https://github.com/1LifeLink1/LifeLink.git
Environment Variables Required:

REACT_APP_SUPABASE_URL=https://[your-project-id].supabase.co
REACT_APP_SUPABASE_PUBLISHABLE_KEY=[YOUR-ANON-KEY]
DATABASE_URL="postgresql://postgres.[your-project-id]:[PASSWORD]@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[your-project-id]:[PASSWORD]@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres"

Build & Deployment:

npm install — Install dependencies
npm start — Dev server on http://localhost:3000
npm run build — Production build (success: 104KB JS + 2.26KB CSS)
Deploy-ready on Vercel/Netlify with env vars
Database Status:

supabase_schema.sql file contains full schema with RLS policies
NOT YET APPLIED to the hosted database (next step after this conversation)
SQL includes all table definitions, constraints, realtime config, and security policies
Known Issues / Next Steps:

Apply supabase_schema.sql to hosted Supabase database to activate profiles table + updated RLS policies
Optional: Add admin profiles view for user management
Optional: Add role-aware dashboard route guards for production
Optional: Add Supabase RLS policy tests for security validation
GitHub Account:

Username: ARD12115
Email: 159651738+ARD12115@users.noreply.github.com
All commits properly signed with git config
That's your context! When you start a new chat, paste this and say:

"I'm continuing work on the LifeLink project. Here's the full context from the previous session. [paste the summary above]. What I want to do next is..."

This will save the AI from needing to ask questions and let them jump straight into helping.

Junie cli API
perm-cGhvZW5peGV5ZXY1QGdtYWlsLmNvbQ==.MGE4MDNlZmItZjliYi00Y2ExLWJlMjgtYTVjM2RmZTQzNjU5.yE93WssQKw0XtjoAw7XSN8HpIfziBQ