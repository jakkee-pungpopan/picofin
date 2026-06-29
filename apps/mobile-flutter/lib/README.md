
## PIN & Biometric flow
- After login, if no PIN is set the app prompts to **create a 6-digit PIN** (verified server-side via `/auth/pin`).
- On subsequent unlocks the app shows a **PIN gate** with an optional **biometric** (Face ID / Fingerprint via `local_auth`).
- Manage under **Security settings** (shield icon on the dashboard): change PIN, toggle biometric unlock.
