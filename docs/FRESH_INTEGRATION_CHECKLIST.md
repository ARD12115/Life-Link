# ✅ LifeLink Integration Checklist

Use this list to verify that a fresh environment is ready for production or heavy testing.

---

## 🏗️ 1. Infrastructure (Supabase)
- [ ] Tables created via `supabase_schema.sql`.
- [ ] RLS enabled on all 6 core tables.
- [ ] Replication (Realtime) enabled for `blood_requests` and `donor_responses`.
- [ ] Anonymous sign-in enabled in Auth settings.

---

## 🏥 2. Hospital Web Portal
- [ ] `.env` created in `/hospital_web` with correct keys.
- [ ] `npm install` completed successfully.
- [ ] App starts via `npm start`.
- [ ] Maps load correctly (MapLibre test).

---

## 📱 3. Donor Native App
- [ ] Expo project initialized in `/donor_app`.
- [ ] Push notification certificates configured (for production).
- [ ] Biometric permissions added to `app.json`.

---

## 📡 4. Communication & Logic
- [ ] VAPID keys generated and synced.
- [ ] Blood compatibility logic (`bloodLogic.js`) verified.
- [ ] Simulation mode functional in both portals.

---

## 🔐 5. Security & Privacy
- [ ] `is_verified` flag verified for hospitals.
- [ ] Donor location jitter verified on map.
- [ ] Phone number masking verified in RLS.

---

## 🚀 Status: Ready for Dev
> [!TIP]
> If all boxes above are checked, you are ready to begin **Phase 4: Mobile App Core**.
