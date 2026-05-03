# Developer Skill Guidelines

This file captures the process and expectations for working on Life Link code, diagnostics, and Supabase integration.
It is intended to be reviewed before and after every change by the developer assistant.

## Recent Updates

- **2024-04-19**: Fixed infinite RLS recursion by simplifying `hospitals` and `donors` select policies in `supabase_schema.sql`
- **2024-04-19**: Disabled magic link authentication, switched to email/password in `Auth.jsx`
- **2024-04-19**: Added Switch Role buttons to dashboards for profile deletion and role switching
- **2024-04-19**: Updated environment variables with actual Supabase project details
- **2024-04-19**: Configured MCP server and installed agent skills
- **2024-04-19**: Added postgres package and db.js for direct database connections
- **2026-05-03**: Rewrote markdown files to strictly reflect standard Email/Password authentication, removing all mentions of Magic Link to match the current configuration.

## Purpose

- Track code changes and integration fixes immediately.
- Keep documentation up to date whenever code is changed.
- Ensure diagnostics and Supabase integration checks are validated before moving to the next task.

## When to update this file

Update this file whenever:

1. A code change is made.
2. A fix is completed.
3. A new diagnostic or troubleshooting step is added.
4. A Supabase integration issue is investigated and solved.
5. A commit/merge is completed.

## Required documentation flow

For each task or fix:

1. Update the relevant markdown files immediately:
   - `README.md`
   - `QUICK_REFERENCE.md`
   - `TROUBLESHOOTING.md`
   - `SUPABASE_SETUP_GUIDE.md`
   - `DEV_SKILL_GUIDELINES.md`

2. Summarize what changed and why in this file.
3. Add a short note in `README.md` or `QUICK_REFERENCE.md` if it affects setup or usage.
4. If the fix is Supabase-specific, also update `SUPABASE_SETUP_GUIDE.md`.

## How to use this file

- Review this file before starting work.
- After completing a code task, write one sentence describing the fix.
- Add a line for each changed document or file.
- Keep the entries chronological.

## Example entry

- [2026-04-18] Fixed Supabase diagnostics panel and added explicit env/auth checks in `DebugDashboard.jsx`.
- [2026-04-18] Resolved infinite RLS recursion by simplifying `hospitals` and `donors` select policies in `supabase_schema.sql`.
- Updated `README.md` to mention `?debug=true` developer mode.
- Added this `DEV_SKILL_GUIDELINES.md` file as the canonical process note.

## Launch checklist

Before moving to the next task, confirm:

- [ ] Code compiles successfully.
- [ ] Supabase env vars are present and valid.
- [ ] Diagnostics panel reports success or clear failure messages.
- [ ] Relevant docs are updated.
- [ ] This skill guideline file is reviewed and appended.

## Notes for the assistant

- Treat this file as the primary developer skill note.
- Check it first when the app is launched or when asked for developer workflow guidance.
- Keep it concise and actionable.
