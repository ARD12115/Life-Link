# 🚶‍♂️ LifeLink Features Walkthrough

Welcome to the LifeLink developer tour! This guide explains how to test every major feature in the current monorepo.

---

## 🏥 Hospital Web Portal
**Location**: `/hospital_web`

### 1. Registration & Security
- [ ] **Sign Up**: Create a hospital account with an email and password.
- [ ] **Security**: Your facility must be marked `is_verified: true` in the Supabase database to send real alerts.

### 2. Posting Requests
- [ ] **Emergency Feed**: Create a "Critical" request for B+ blood.
- [ ] **Real-time Patching**: Notice the dashboard updates instantly without a page refresh.

### 3. Response Management
- [ ] **Donor Tracking**: Watch the "Active Responses" tab update as donors respond via the app.

---

## 📱 Donor Native App (In Dev)
**Location**: `/donor_app`

### 1. Instant Onboarding
- [ ] **Anonymous Access**: One-tap "Become a Hero" entry without passwords.
- [ ] **Biometrics**: FaceID/Fingerprint login for returning donors.

### 2. Emergency Alerts
- [ ] **Push Notifications**: Experience 100% reliable alerts even when the app is closed.
- [ ] **Native Map**: Pan and zoom smoothly to see nearby needs with jittered privacy.

---

## 🧪 Testing the "WOW" Factors

### The Simulation Mode
> [!TIP]
> Use these steps to demo the platform without setting up real SMS or Mapbox accounts.

| Feature | How to Test |
| :--- | :--- |
| **Native Push** | Click **"Send Test Push"** in the Donor Hub. |
| **SMS Logic** | Create a request and check the **Browser Console (F12)** for mock alert logs. |
| **Privacy Map** | Zoom into any donor marker on the map to see the 200m randomized offset. |

---

## 🛡️ Security Audit Note
All features listed above are protected by **Row-Level Security (RLS)**. No user can see data they are not authorized to access.
