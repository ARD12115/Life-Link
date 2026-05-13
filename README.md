<p align="center">
  <img src="hospital_web/public/LOGO.png" alt="LifeLink Logo" width="120" />
</p>

<h1 align="center">LifeLink</h1>

<p align="center">
  <strong>The Ultimate Emergency Blood Donor Ecosystem.</strong><br/>
  Connecting hospitals with donors through military-grade security and instant native notifications.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Status-Production--Ready-success" alt="Production Ready" />
  <img src="https://img.shields.io/badge/Platform-Web%20%2B%20Mobile-blue" alt="Web + Mobile" />
  <img src="https://img.shields.io/badge/Security-Hardened-red" alt="Security Hardened" />
</p>

---

## 🏗️ Project Architecture
LifeLink is a specialized monorepo designed for scale and security:

- **[`/hospital_web`](./hospital_web)**: Professional desktop dashboard for medical facility staff.
- **[`/donor_app`](./donor_app)**: Native iOS, Android, and PC application for blood donors.
- **[Shared Backend](./SUPABASE_SETUP_GUIDE.md)**: Hardened Supabase (PostgreSQL) with strict RLS policies.

---

## 🚀 Getting Started
### 1. Hospital Web
```bash
cd hospital_web && npm start
```
### 2. Donor Mobile App
```bash
cd donor_app && npx expo start
```

---

## 🔐 Privacy & Security
- **Data Masking**: PII (Personally Identifiable Information) is protected via database-level RLS.
- **Location Jitter**: Donor coordinates are randomized by 200m to protect home addresses.
- **Biometric SecureStore**: Session tokens are hardware-encrypted on mobile devices.

---

## 📚 Resource Links
- **[Full Walkthrough](./FEATURES_WALKTHROUGH.md)**: Features & testing guide.
- **[Pentest Report](./SECURITY_PENTEST_REPORT.md)**: Security audit results.
- **[Mobile Plan](./MOBILE_STRATEGY_PLAN.md)**: Roadmap history.
- **[Troubleshooting](./TROUBLESHOOTING.md)**: Help for setup issues.

---
<p align="center">Saving lives through high-performance engineering. 🩸</p>
