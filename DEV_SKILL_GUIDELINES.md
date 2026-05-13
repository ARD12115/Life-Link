# 🧠 LifeLink Developer Skill Guidelines

Best practices for contributing to the LifeLink monorepo.

---

## 🎨 Design System
- **Web**: Use the variables in `index.css`. Stick to **Glassmorphism** (backdrops, blur, subtle borders).
- **Mobile**: Mirror the web aesthetic using native styling. Focus on high-contrast readability for emergency situations.

---

## ⚡ Real-time Patterns
> [!IMPORTANT]
> Never do a full page re-fetch for real-time updates.
1. Use the `supabase.channel().on('postgres_changes', ...)` pattern.
2. Patch local state (e.g., `setRequests(prev => [...prev, newRequest])`) for instant UI updates.
3. Handle **Edge Cases**: Ensure subscriptions are cleaned up in `useEffect` returns to prevent memory leaks.

---

## 🛡️ Security First
- **RLS Awareness**: Always assume the user can call the Supabase SDK directly. Never rely on frontend-only validation.
- **Data Minimization**: Only query the columns you actually need.
- **Privacy**: Use the `processedDonors` pattern in maps to anonymize locations before rendering.

---

## 📱 Mobile-Specific Rules (Donor App)
- **Offline First**: Use `AsyncStorage` or `SecureStore` to ensure the app works during network drops.
- **Battery Life**: Minimize background geolocation updates. Only track when the donor is "Available."
- **Touch Targets**: All interactive elements must be at least **44x44 points** for easy tapping during stressful emergencies.

---

## 🔄 Git Workflow
1. **Branching**: `feature/mobile-auth`, `bugfix/map-rendering`.
2. **Commits**: Clear, concise messages (e.g., `feat: added native biometric login`).
3. **Pull Requests**: Include a screenshot or recording of UI changes.
