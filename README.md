# NovaBank — Demo Mobile Banking System

> ⚠️ **This is a demo banking system. Do not use for real financial transactions.**
> All money movement is **sandbox/mock only**. No real bank, payment network, or PromptPay is connected.

NovaBank is an enterprise-style mobile banking MVP with an original brand (deep-indigo + teal),
built as a monorepo. It is **not** a clone of any existing bank app — UX, colors, names, and assets are original.


## Windows one-click start
1. Install **Docker Desktop** and open it (wait until it says *Running*).
2. Extract the project, then **double-click `start.bat`**.
   It checks Docker, creates `.env`, builds, starts everything, waits for the API,
   and opens the admin dashboard + API docs in your browser automatically.
3. To stop later, double-click **`stop.bat`**.

## Architecture

```
Flutter App ─┐
             ├─► NestJS Backend API ─► PostgreSQL (Prisma ORM)
Next.js Admin┘            │            └─► Redis (cache / future sessions)
                          └─► Swagger /api/docs
```

- **Mobile**: Flutter (clean layered structure: core / data / state / presentation)
- **Backend**: NestJS + Prisma + PostgreSQL + Redis
- **Admin**: Next.js (App Router)
- **Auth**: JWT access (short-lived) + refresh-token rotation + PIN + biometric-ready
- **Security**: bcrypt, rate limiting, input validation, RBAC, audit logs, helmet, atomic transfers

## Monorepo layout
```
/novabank
  /apps
    /mobile-flutter      Flutter app
    /admin-dashboard     Next.js admin
    /backend-api         NestJS API + Prisma
  /packages
    /shared-types        Shared TS contracts
    /ui-kit              Shared design tokens
  docker-compose.yml
  .env.example
  README.md
```

## Quick start (Docker — recommended)
```bash
cp .env.example .env          # never commit real secrets
docker compose up -d --build  # postgres + redis + backend + admin
# backend auto-runs: prisma migrate deploy → seed → start
```
- API:        http://localhost:3000  (docs: http://localhost:3000/api/docs)
- Admin:      http://localhost:3001
- Postgres:   localhost:5432   Redis: localhost:6379

## Quick start (manual / local dev)
```bash
# 1) infra
docker compose up -d postgres redis

# 2) backend
cd apps/backend-api
cp ../../.env.example .env        # or export DATABASE_URL / REDIS_URL / JWT secrets
npm install
npx prisma migrate dev --name init   # create schema + migration
npm run seed                          # load demo data
npm run start:dev                     # http://localhost:3000

# 3) admin dashboard
cd ../admin-dashboard && npm install && npm run dev   # http://localhost:3001

# 4) mobile
cd ../mobile-flutter && flutter pub get
flutter run --dart-define=API_URL=http://10.0.2.2:3000/api   # Android emulator
```

## Demo credentials
| Role     | Email                     | Password       | PIN    |
|----------|---------------------------|----------------|--------|
| Customer | somchai@novabank.local    | Password@123   | 123456 |
| Customer | malee@novabank.local      | Password@123   | 123456 |
| Admin    | admin@novabank.local      | Admin@123      | —      |

## API endpoints
```
POST /api/auth/register      POST /api/auth/login      POST /api/auth/refresh   POST /api/auth/logout
POST /api/auth/pin           POST /api/auth/pin/verify
GET  /api/users/me           PATCH /api/users/me/security
GET  /api/accounts           GET  /api/accounts/:id
GET  /api/transactions
POST /api/transfers
GET  /api/recipients         POST /api/recipients
GET  /api/notifications      PATCH /api/notifications/:id/read
GET  /api/billers            POST /api/billers/pay          (placeholder)
POST /api/qr/generate        POST /api/qr/scan              (placeholder)
POST /api/admin/login        GET  /api/admin/dashboard
GET  /api/admin/users        GET  /api/admin/transactions   GET /api/admin/audit-logs
```
Full interactive docs at `/api/docs` (Swagger/OpenAPI).

## Database schema (Prisma → PostgreSQL)
`users`, `user_devices`, `refresh_tokens`, `accounts`, `transactions`,
`transfer_recipients`, `billers`, `notifications`, `audit_logs`, `admin_users`.
Balances/amounts are stored in **satang (BigInt integer)** — no floating-point money errors.

## Security model
- Passwords & PINs hashed with **bcrypt**.
- **JWT access** token short TTL (default 15m) + **refresh-token rotation** (old token revoked on use, hashed at rest).
- **Rate limiting** (`@nestjs/throttler`), **helmet**, global **validation** (`class-validator`, whitelist).
- **RBAC** on admin routes (`SUPER_ADMIN` / `ADMIN` / `AUDITOR`).
- **Audit logs** written for register, login, logout, transfers, admin login.
- **Atomic transfers** via Prisma `$transaction` with amount/balance/limit validation.
- **No hardcoded secrets** — everything via `.env` (see `.env.example`).
- SQL-injection-safe via Prisma parameterized queries.

## Tests
```bash
cd apps/backend-api && npm test     # money utils + transfer validation/atomic flow
cd apps/mobile-flutter && flutter test
```

## End-to-end happy path
register → login → GET /accounts → POST /transfers (mock) → GET /transactions → see receipt + audit log.

---
NovaBank is for demonstration and educational purposes only.
