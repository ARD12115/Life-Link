# 🩸 LifeLink — AI Context & Architecture Guide

Use this document to bring any AI assistant or developer up to speed on the LifeLink ecosystem.

---

## 🏗️ System Architecture: Monorepo
The project is split into two specialized workspaces to ensure performance and security:

### 1. 🏥 Hospital Web Portal (`/hospital_web`)
- **Tech**: React 18, Create React App, Vanilla CSS.
- **Focus**: High-density desktop dashboard for medical staff.
- **Key Features**: Request management, real-time matching, donor response tracking.

### 2. 📱 Donor Native App (`/donor_app`)
- **Tech**: React Native + Expo (In Development).
- **Focus**: Native iOS/Android/Desktop experience for donors.
- **Key Features**: Hardware-reliable push notifications, biometrics, native maps.

---

## 🔐 Security & Privacy (Hardened)
Security is non-negotiable for medical data. The system implements a **Zero-Trust** model:

- **RLS (Row Level Security)**: All PostgreSQL tables have strict RLS enabled.
- **Data Masking**: Donor phone numbers are masked and only revealed to a hospital once a match is confirmed.
- **Hospital Verification**: A mandatory `is_verified` flag prevents unauthorized facilities from triggering alerts.
- **Anonymous Auth**: Donors use authenticated anonymous sessions to protect identity while retaining historical records.

---

## 📡 Real-time & Notifications
- **Engine**: Supabase Realtime (PostgreSQL Changes).
- **Strategy**: 
  - **Hospital side**: Instant UI patching via `useRequests.js` (no full re-fetches).
  - **Donor side**: Native Push (Expo) for reliable background alerting.
- **Maps**: Powered by **MapLibre GL JS** (Open Source) using CartoDB Dark Matter tiles. No API keys required for development.

---

## 🛠️ Tech Stack Cheat Sheet
- **Backend**: Supabase (Auth, DB, Edge Functions, Storage).
- **Maps**: MapLibre GL JS / Native.
- **Icons**: Lucide React / Lucide React Native.
- **Design**: Premium "Glassmorphism" system defined in `hospital_web/src/index.css`.

---

## 🎯 Current Objective
We are currently in **Phase 4**: Initializing the Expo project in `/donor_app` and porting the core donor logic to a native mobile environment.
