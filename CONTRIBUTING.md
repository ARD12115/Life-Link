# Contributing to LifeLink

Guidelines for developing, documenting, and maintaining the LifeLink codebase.

---

## Development Workflow

### Before starting work

1. Pull the latest changes from `main`
2. Read this file and any relevant docs in the project
3. Ensure `npm start` compiles without errors

### While working

- Keep changes focused — one feature or fix per commit
- Test in both light and dark themes
- Verify real-time sync works (open two tabs)
- Check browser console (F12) for errors

### After completing work

1. Run `npm run build` to verify production build succeeds
2. Update documentation if your change affects setup, architecture, or user-facing behavior
3. Commit with a descriptive message following conventional commits:
   - `feat:` for new features
   - `fix:` for bug fixes
   - `docs:` for documentation changes
   - `refactor:` for code restructuring
   - `style:` for CSS/UI changes

---

## Documentation Rules

When making code changes, update the relevant documentation:

| What changed | Update these files |
|--------------|--------------------|
| New component or route | `README.md` (Project Structure, Architecture) |
| Database schema change | `README.md` (Database Schema), `supabase_schema.sql` |
| Supabase configuration | `SUPABASE_SETUP_GUIDE.md` |
| Bug fix or known issue | `TROUBLESHOOTING.md` |
| Development process | `CONTRIBUTING.md` (this file) |

---

## Project Conventions

### Styling

- All styles live in `src/index.css` using CSS custom properties (design tokens)
- Use existing CSS classes (`.ui-panel`, `.btn-solid`, `.badge`, etc.) before creating new ones
- Inline styles are acceptable for one-off layout adjustments in JSX
- The design system supports light, dark, and system themes via `ThemeContext.js`

### Components

- Components live in `src/components/`
- Hooks live in `src/hooks/`
- Utility modules live in `src/lib/`
- Context providers live in `src/context/`

### Supabase

- All database queries go through the Supabase client (`src/lib/supabase.js`)
- Real-time subscriptions must clean up on component unmount
- Use `isMounted` refs to prevent state updates after unmount
- Wrap API calls in `try-catch` blocks with meaningful error messages

### Console Logging

The project uses emoji-prefixed console messages for quick visual scanning:

| Emoji | Meaning |
|-------|---------|
| ✅ | Success |
| ❌ | Error |
| 📡 | Network / fetch operation |
| 🔄 | Real-time change event |
| 👥 | Donor/user data operation |
| 🏥 | Hospital data operation |

---

## Environment Setup

### Required

```dotenv
REACT_APP_SUPABASE_URL=https://<project-id>.supabase.co
REACT_APP_SUPABASE_PUBLISHABLE_KEY=<anon-key>
```

### Optional (for direct DB access)

```dotenv
DATABASE_URL=postgresql://postgres:<password>@db.<project-id>.supabase.co:5432/postgres
```

Never commit real credentials. The `.gitignore` excludes `.env`, `.env.local`, and all `.env.*.local` files.

---

## Launch Checklist

Before merging or deploying, confirm:

- [ ] `npm start` compiles without errors
- [ ] `npm run build` succeeds
- [ ] Browser console shows no red errors (yellow warnings are OK)
- [ ] Authentication flow works (sign up → confirm → sign in)
- [ ] Real-time updates work across two tabs
- [ ] Both light and dark themes render correctly
- [ ] Documentation is updated for any user-facing changes

---

## Changelog

| Date | Change |
|------|--------|
| 2026-05-12 | Consolidated documentation — merged 7 files into 4 focused docs |
| 2026-05-03 | Rewrote all docs to reflect email/password auth (removed magic link references) |
| 2026-05-03 | UI overhaul — landing page, top-nav, split-screen auth, router-based navigation |
| 2024-04-19 | Fixed infinite RLS recursion — simplified `hospitals` and `donors` select policies |
| 2024-04-19 | Switched from magic link to email/password authentication |
| 2024-04-19 | Added Switch Role buttons to dashboards |
| 2024-04-19 | Configured MCP server and installed agent skills |
| 2024-04-19 | Added `postgres` package and `db.js` for direct database connections |
