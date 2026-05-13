<p align="center">
  <img src="hospital_web/public/LOGO.png" alt="LifeLink Logo" width="120" />
</p>

<h1 align="center">LifeLink</h1>

<p align="center">
  <strong>Real-time emergency blood donor matching ecosystem.</strong><br/>
  A dual-platform network connecting hospitals with donors instantly through native push and professional web dashboards.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white" alt="React 18" />
  <img src="https://img.shields.io/badge/Expo-Native-000020?logo=expo&logoColor=white" alt="Expo Native" />
  <img src="https://img.shields.io/badge/Supabase-Realtime-3FCF8E?logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/PostgreSQL-Hardened-4169E1?logo=postgresql&logoColor=white" alt="PostgreSQL" />
</p>

---

## 🏗️ Project Structure
LifeLink is managed as a monorepo for maximum efficiency and shared logic:

- **[`/hospital_web`](./hospital_web)**: A high-density dashboard for medical facilities.
- **[`/donor_app`](./donor_app)**: (Active Development) A native mobile experience for donors (iOS/Android/PC).
- **[Root Documentation](#-documentation)**: Comprehensive guides for setup, security, and strategy.

---

## 🚀 Quick Start
1. **Clone the repo**: `git clone ...`
2. **Setup Backend**: Follow the **[Supabase Guide](./SUPABASE_SETUP_GUIDE.md)**.
3. **Run Hospital Portal**:
   ```bash
   cd hospital_web
   npm install && npm start
   ```
4. **Run Donor App**:
   ```bash
   cd donor_app
   npx expo start
   ```

---

## 📚 Documentation
- **[Features Walkthrough](./FEATURES_WALKTHROUGH.md)**: Explore the platform.
- **[Security Pentest Report](./SECURITY_PENTEST_REPORT.md)**: Privacy & Hardening audit.
- **[Mobile Strategy Plan](./MOBILE_STRATEGY_PLAN.md)**: The vision for the donor app.
- **[Troubleshooting](./TROUBLESHOOTING.md)**: Fixes for common setup issues.

---

## 🛡️ Security & Privacy
LifeLink is built with **Privacy by Design**:
- **Field-Level Encryption**: Sensitive data is masked via PostgreSQL RLS.
- **Location Anonymization**: Donor positions are "jittered" on public maps to protect home addresses.
- **Hardware Security**: Native apps use the device's Secure Enclave for session storage.

---

## 🤝 Contributing
Please read our **[Contributing Guidelines](./CONTRIBUTING.md)** before submitting a pull request.

---
<p align="center">Built with ❤️ for the global medical community.</p>
