# 🚀 LifeLink Quick Reference (Cheat Sheet)

The fastest way to navigate and manage the LifeLink project.

---

## 📂 Navigation
| Path | Content |
| :--- | :--- |
| **`hospital_web/src`** | Hospital portal source code. |
| **`donor_app/`** | Native mobile app source code. |
| **`hospital_web/src/hooks`** | Core real-time & auth logic. |
| **`hospital_web/src/lib`** | Supabase client initialization. |

---

## ⌨️ Command Shortcuts
### Hospital Web
- `cd hospital_web`
- `npm start`: Start dev server.
- `npm run build`: Production bundle.

### Donor App
- `cd donor_app`
- `npx expo start`: Start mobile dev server.

---

## 🔗 Documentation Links
- **[Full Walkthrough](./FEATURES_WALKTHROUGH.md)**: How to test features.
- **[Security Report](./SECURITY_PENTEST_REPORT.md)**: Security & Privacy audit.
- **[Mobile Plan](./MOBILE_STRATEGY_PLAN.md)**: The roadmap for the app.
- **[Troubleshooting](./TROUBLESHOOTING.md)**: Common fixes.

---

## 🔑 Key Environment Variables
> [!NOTE]
> All keys should be placed in `hospital_web/.env` and eventually `donor_app/.env`.

| Variable | Source |
| :--- | :--- |
| `REACT_APP_SUPABASE_URL` | Supabase Dashboard |
| `REACT_APP_SUPABASE_ANON_KEY` | Supabase Dashboard |
| `REACT_APP_VAPID_PUBLIC_KEY` | `npx web-push generate-vapid-keys` |

---

## 🛡️ Database Verification
Run this SQL query to verify your hospital role:
```sql
SELECT role FROM profiles WHERE user_id = 'your-id';
```
