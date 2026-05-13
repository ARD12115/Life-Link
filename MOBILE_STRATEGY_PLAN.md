# 📱 LifeLink Multi-Platform Strategy Plan

## 🎯 Goal
Transition LifeLink from a unified web portal into a specialized ecosystem:
1. **Hospital Web Portal**: A desktop-optimized professional dashboard for medical facilities.
2. **Donor Native App**: A cross-platform (iOS/Android/Desktop) application for instant donor engagement.

---

## 🏗️ Phase 1: Architectural Split

### 1. The Monorepo Structure
We will move to a workspace-style structure to share code while keeping the apps separate.
- `/apps/hospital-web`: The current React project (optimized for Desktop).
- `/apps/donor-mobile`: New React Native + Expo project.
- `/packages/shared`: Shared logic (Supabase client, blood logic, types).

### 2. Technology Stack (Donor App)
- **Framework**: **React Native + Expo**.
- **Reason**: We can reuse your current React knowledge and logic while getting 100% native performance on iOS and Android.
- **Desktop/Laptop Support**: Use **Expo Web** + **Electron** wrapper for a dedicated PC/Mac app.

---

## 🚀 Phase 2: Donor App Features (Native-Only)

### 1. High-Reliability Notifications
- Replace Web Push with **Expo Push Notifications**.
- **Critical Alerts**: On iOS/Android, we can request permission for "Critical Alerts" that bypass the mute switch for Life-or-Death emergencies.

### 2. Native Geolocation
- Use the phone's built-in GPS for more accurate background tracking (only when the donor is "Available").
- **Geofencing**: Automatically alert donors only when they enter a city with an active emergency.

### 3. Biometric Security
- **FaceID / Fingerprint**: Secure access to the donor profile and medical history without typing passwords every time.

---

## 🏥 Phase 3: Hospital Web Enhancements

### 1. Desktop Optimization
- Remove all mobile-specific layouts from the Hospital side.
- Focus on multi-pane layouts, data exports (CSV/PDF), and complex response management.

### 2. Verification Dashboard
- Implement the "Hospital Verification" UI where admins can approve facilities before they go live.

---

## 📈 Implementation Timeline

| Week | Focus | Deliverables |
| :--- | :--- | :--- |
| **1** | **Restructure** | Monorepo setup & Expo initialization |
| **2** | **Mobile Foundation** | Native Auth flow & Profile management |
| **3** | **Emergency Engine** | Native Push notifications & Map integration |
| **4** | **Desktop/PC** | Electron wrapper & final QA |

---

## ❓ Open Questions for Review

1. **App Stores**: Do you plan to publish the Donor App to the Apple App Store and Google Play Store ($99/year and $25 one-time respectively)?
2. **Desktop Priority**: Is the "Laptop/PC" donor app as important as the mobile one, or can we start with iOS/Android first?
3. **Hospital Branding**: Should the Hospital portal be moved to a subdomain (e.g., `hospital.lifelink.com`)?

---
