# 🤝 Contributing to LifeLink

Thank you for your interest in improving LifeLink! We are building a life-saving network, and your contributions are vital.

---

## 🛠️ Getting Started
1. **Choose a Workspace**:
   - For Web fixes: `cd hospital_web`
   - For Mobile features: `cd donor_app`
2. **Setup Env**: Copy `.env.example` to `.env` in the respective folder.
3. **Database**: Use the latest `supabase_schema.sql` found in the root.

---

## 🛡️ Contribution Principles
- **Security First**: If your change touches RLS or Auth, it must be peer-reviewed.
- **Privacy by Design**: Never log PII (Personally Identifiable Information) like phone numbers or emails.
- **Real-time Optimized**: Always use optimized subscriptions rather than polling.

---

## 🎨 UI/UX Standards
- **Premium Feel**: Follow the "Glassmorphism" system in `index.css`.
- **Accessibility**: Ensure all buttons have descriptive ARIA labels and a minimum touch target size of 44px.
- **Dark Mode**: Support both light and dark themes in every component.

---

## 🚀 Pull Request Process
1. Create a descriptive branch: `feature/native-biometrics`.
2. Ensure the code compiles without warnings.
3. Update relevant documentation if you add a new feature.
4. **Include a Video/Screenshot**: For any UI changes, a visual demo is required in the PR description.

---

## 📜 Code of Conduct
Be respectful, professional, and remember that we are building this for people in critical medical need.
