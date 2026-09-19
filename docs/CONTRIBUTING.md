# 🤝 Contributing to LifeLink

Thank you for improving LifeLink! We're building a life-saving emergency blood network — your contributions directly impact real outcomes.

---

## 🛠️ Getting Started

### 1. Choose Your Workspace
```bash
# Hospital Web (React 18, desktop dashboard)
cd hospital_web

# Donor App (Expo 55, React Native, iOS/Android/Desktop)
cd donor_app
```

### 2. Environment Setup
```bash
# Each app has its own .env (copy from .env.example)
cp hospital_web/.env.example hospital_web/.env
cp donor_app/.env.example donor_app/.env
# Fill in your Supabase credentials
```

### 3. Database
Use the canonical schema: `hospital_web/supabase_schema.sql`
- Run in Supabase SQL Editor
- Enables RLS, Realtime, and all policies

### 4. Run Locally
```bash
# From root LifeLink/
npm run install-all   # First time only
npm start             # Launches BOTH apps concurrently
```

---

## 🛡️ Contribution Principles

| Principle | What It Means |
|-----------|---------------|
| **Security First** | Any change touching RLS, Auth, or PII requires peer review |
| **Privacy by Design** | Never log PII (phones, emails, names) to console in production code |
| **Real-time Optimized** | Use `postgres_changes` subscriptions — never poll |
| **Offline Resilient** | Mobile: assume network fails; cache state in SecureStore |
| **Accessibility Default** | 44px touch targets, ARIA labels, color contrast, screen reader support |

---

## 🎨 UI/UX Standards

### Design System (Glassmorphism)
- **Web**: Variables in `hospital_web/src/index.css`
  - `--bg-app`, `--bg-card`, `--border-soft`, `--accent-red/blue/green/orange`
  - `backdrop-filter: blur(16px)` on panels
  - Subtle borders: `1px solid rgba(255,255,255,0.1)`
- **Mobile**: Mirror aesthetic with `StyleSheet` in `donor_app/theme/`
  - High contrast for emergency visibility
  - Dark mode support in both

### Component Rules
- **Touch targets**: Minimum 44×44pt (mobile) / 40×40px (web)
- **Loading states**: Skeletons (`CardSkeleton` component) — no spinners on content
- **Error states**: Toast (`react-hot-toast` web / `Alert.alert` mobile) + inline fallback
- **Animations**: `fade-in` class (web) / Reanimated (mobile) — 200-300ms max

---

## 🔄 Git Workflow

### Branching
```
main
├── feature/short-description     # New features
├── bugfix/short-description      # Bug fixes
├── refactor/short-description    # Code improvements
└── docs/short-description        # Documentation only
```

### Commits
Follow Conventional Commits:
```
feat: add native biometric login for donors
fix: resolve donor map jitter on iOS 17
refactor: extract blood compatibility to shared lib
docs: update Supabase setup guide for Edge Functions
```

### Pull Requests
**Required:**
- [ ] Code compiles without warnings (`npm run build` / `npx tsc --noEmit`)
- [ ] **Visual demo**: Screenshot or 30-sec screen recording for ANY UI change
- [ ] Related docs updated (this file, docs/FEATURES_WALKTHROUGH.md, etc.)
- [ ] No hardcoded secrets or console.log PII

**PR Template:**
```markdown
## Summary
Brief description of changes

## Type
- [ ] Feature
- [ ] Bug Fix
- [ ] Refactor
- [ ] Docs

## Testing
- [ ] Hospital Web tested
- [ ] Donor App tested (device/simulator)
- [ ] Real-time sync verified
- [ ] Simulation mode works

## Screenshots/Recording
[Attach or link]

## Checklist
- [ ] No console.log PII
- [ ] RLS policies considered
- [ ] Touch targets ≥ 44px
- [ ] Dark mode works
```

---

## 🔒 Security Review Checklist

For any PR touching data access:

- [ ] **RLS verified**: Query respects existing policies
- [ ] **No client-side authz**: Never `if (user.role === 'admin')` — enforce in DB
- [ ] **Minimal columns**: `.select('id, name, blood_group')` not `*`
- [ ] **Phone masking**: Hospital sees phone ONLY after donor confirms
- [ ] **Anonymous safety**: Rate limiting considered for public endpoints

---

## 🧪 Testing Requirements

| Change Type | Minimum Testing |
|-------------|-----------------|
| Hospital UI | Chrome + Firefox, desktop only |
| Donor UI | iOS Simulator + Android Emulator + Expo Go |
| Real-time | Both apps open side-by-side |
| Auth flow | Fresh anonymous + email/password |
| Schema change | Run `supabase_schema.sql` on clean DB |

---

## 📦 Release Process

1. **Version bump** in `package.json` (both apps)
2. **Changelog** entry in PR
3. **Deploy**:
   - Hospital Web → Vercel/Netlify (auto on main)
   - Donor App → EAS Build → Store / Internal
4. **Supabase migrations** (if schema changed) → `supabase db push`

---

## 📜 Code of Conduct

- Be respectful and professional
- Remember: this software is used in **medical emergencies**
- No ego — best idea wins
- Report security issues privately: security@lifelink.example.com

---

## 🆘 Getting Help

- **Architecture questions**: Check `docs/MOBILE_STRATEGY_PLAN.md`
- **Supabase patterns**: Check `docs/SUPABASE_SETUP_GUIDE.md`
- **Bugs**: Check `docs/TROUBLESHOOTING.md` first
- **Security**: Check `docs/SECURITY_PENTEST_REPORT.md`

---

**Together, we save lives. 🩸**