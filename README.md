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

### The Master Controller (One-Command Startup)
LifeLink uses a unified startup script to launch both the web portal and the mobile app simultaneously, while automatically establishing a dynamic IP bridge for your QR codes.

From the root `LifeLink` directory, simply run:
```bash
npm start
```
*This will automatically launch the Hospital Web Portal (React) and the Donor Mobile App (Expo) in parallel.*

### Environment Setup
Before starting, ensure you have configured your environment variables using the provided templates:
1. Copy `hospital_web/.env.example` to `hospital_web/.env`
2. Copy `donor_app/.env.example` to `donor_app/.env`
*(The `hospital_web/.env.local` file is generated automatically by the startup script for your IP bridge).*

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
