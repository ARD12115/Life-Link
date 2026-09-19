# 🩸 LifeLink — AI Context & Architecture Guide

Use this document to bring any AI assistant or developer up to speed on the LifeLink ecosystem.

---

## 🏗️ System Architecture: Monorepo
The project is a high-performance monorepo with two production-ready platforms:

### 1. 🏥 Hospital Web Portal (`/hospital_web`)
- **Status**: ✅ Production Ready
- **Focus**: Desktop-optimized emergency management for medical staff.

### 2. 📱 Donor Native App (`/donor_app`)
- **Status**: ✅ Production Ready
- **Focus**: Cross-platform (iOS/Android) experience for donors.
- **Key Feature**: Native hardware-level security (SecureStore) and system-level Push Notifications (Expo).

---

## 🔐 Security & Privacy (Military Grade)
- **RLS (Row Level Security)**: Strict data masking. Donor phone numbers are hidden until a match is confirmed.
- **Hospital Verification**: The `is_verified` system prevents unauthorized alerts.
- **Hardware Encryption**: Mobile sessions are stored in the device's Secure Enclave, not a browser.

---

## 📡 Real-time & Notifications
- **Engine**: Supabase Realtime (PostgreSQL Changes).
- **Push System**: Native Expo Push tokens linked to `push_subscriptions`.
- **Maps**: GPU-accelerated **MapLibre Native** with 200m location jittering for privacy.

---

## 🎯 Current Status
The LifeLink ecosystem is **fully operational**. We have successfully transitioned from a unified web portal to a specialized, secure, multi-platform network.
