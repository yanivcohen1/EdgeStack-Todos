## EdgeStack Todos

Full-stack Next.js 16 application built with Material UI, MikroORM, and MongoDB 3.4. The app implements email/password authentication, short-lived JWT access tokens with refresh rotation, rate limiting, and filterable todo lists backed by React Query.

### Stack

- Next.js 16 (App Router, TypeScript)
- Material UI 6 + Joy UI helpers
- MikroORM + MongoDB 3.4 (no Docker dependency; connect to any Mongo instance)
- Axios with automatic access-token refresh
- React Hook Form + Zod validation
- Vitest + Playwright for testing

### Features

- Email/password auth with registration, login, logout, and rotating refresh tokens.
- Role-aware dashboard layouts (admin, inter, main, todo) backed by protected App Router routes.
- Todo management with filtering, dialog-driven CRUD, and status summaries powered by React Query.
- Built-in rate limiting, password hashing, and JWT session utilities for secure APIs.
- Responsive Material UI theme with dark/light toggle and reusable layout components.
- End-to-end test coverage via Vitest + Playwright and seeded demo data for local workflows.

### Prerequisites

- Node 20+
- pnpm 9+
- MongoDB 3.4-compatible instance reachable via `DATABASE_URL`

### Environment

Duplicate `.env.development` and `.env.production` as needed. Key variables:

- `DATABASE_URL` – Mongo connection string
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` – symmetric secrets
- `JWT_ACCESS_TTL_SECONDS`, `JWT_REFRESH_TTL_SECONDS` – token lifetimes (shared across envs)
- `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX_ATTEMPTS` – in-memory limiter controls
- `SEED_DEMO_PASSWORD` – password used by the seed script

### Scripts

```bash
pnpm install           # install dependencies
pnpm dev               # run Next.js in development mode
pnpm build             # production build
pnpm start             # serve the production build
pnpm lint              # Next.js lint (ESLint)
pnpm test              # Vitest unit tests
pnpm test:watch        # Vitest in watch mode
pnpm coverage          # Vitest coverage report
pnpm db:seed           # seed demo user/todos via MikroORM
```

### Seeding

Ensure `DATABASE_URL` and `SEED_DEMO_PASSWORD` are set, then run `pnpm db:seed`. The script wipes users/todos/refresh tokens and repopulates them with a demo account for local testing.

### Development Flow

1. Start MongoDB (local service, container, or Atlas cluster).
2. Configure `.env.development`.
3. `pnpm db:seed` (optional) for demo data.
4. `pnpm dev` to launch the Next.js dev server at `http://localhost:3000`.

### Deployment Notes

- The app expects a MongoDB connection string at runtime; provide it via environment variables.
- JWT secrets must be strong, random strings.
- Rate limiting is in-memory and should be swapped for Redis/Upstash in multi-instance deployments.

### Project Structure

```
├── docs/                  # Architecture notes and technical overviews
├── public/                # Static assets served by Next.js
├── scripts/               # Seed and maintenance scripts (e.g., MikroORM seeding)
├── src/
│   ├── app/               # App Router routes (auth, dashboard, API endpoints)
│   ├── components/        # Reusable UI widgets (auth forms, todos, layout pieces)
│   ├── hooks/             # Client hooks for auth, theme mode, and todos
│   ├── lib/               # Env, API, auth, db, and validation helpers
│   ├── theme/             # Material UI theme tokens
│   └── types/             # Shared TypeScript models
├── tests/                 # E2E Playwright specs
├── eslint.config.mjs      # Next.js lint configuration
├── next.config.ts         # Next.js runtime config
└── package.json           # Scripts and dependencies
```
