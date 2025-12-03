## Time-Management-App

Full-stack Next.js 16 application built with Material UI, MikroORM, and MongoDB 3.4 and Cypress(E2E) and Vite. The app implements email/password authentication, short-lived JWT access tokens with refresh rotation, rate limiting, and filterable todo lists backed by React Query.

### Stack

- Next.js 16 (App Router, TypeScript)
- Material UI 6 + Joy UI helpers
- PrimeReact + PrimeIcons (UI components)
- MikroORM + MongoDB (compatible with 3.4+)
- TanStack Query (React Query)
- Axios with automatic access-token refresh
- React Hook Form + Zod validation
- Lucide React (Icons)
- Vitest unit tests 
- Cypress for E2E tests

### Features

- Email/password auth with registration, login, logout, and rotating refresh tokens.
- Role-aware dashboard layouts (admin, inter, main, todo) backed by protected App Router routes and filtered navigation.
- Admin console breadcrumb with PrimeReact icons that jumps between `/admin/1` and `/admin/3/user/2?id=1&name=yar`, showing the active admin/user IDs and query params inside shared layout panels, plus an Inter workspace deep-link at `/admin/inter/3?id=1&name=yar` that opens its own guarded page with the legacy Inter content and surfaces `inter_id`, `id`, and `name` parameters.
- Todo management with filtering, dialog-driven CRUD, and status summaries powered by React Query.
- Jira-style Scrum board with drag-and-drop support for managing todo statuses (Pending, In Progress, Completed).
- Quick profile inspector on the Todo page that pings the API and surfaces the current name + role via snackbar.
- Built-in rate limiting, password hashing, and JWT session utilities for secure APIs.
- Responsive Material UI theme with dark/light toggle and reusable layout components.
- End-to-end test coverage via Vitest + Cypress and seeded demo data for local workflows.

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
- `SEED_DEMO_PASSWORD` / `SEED_ADMIN_PASSWORD`, `SEED_USER_PASSWORD` – seed credentials for admin + member accounts
- `SEED_ADMIN_EMAIL`, `SEED_ADMIN_NAME`, `SEED_USER_EMAIL`, `SEED_USER_NAME` – configure seeded identities

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
pnpm test:e2e          # Cypress end-to-end tests with reporter (runs `cross-env CYPRESS_REPORTER=cypress-mochawesome-reporter cypress run --e2e --browser chrome`)
pnpm test:e2e:no-report # Cypress end-to-end tests without reporter (runs `cypress run --e2e --browser chrome`)
```

Run `npx cypress install` once per environment to ensure the browser binaries required by `pnpm test:e2e` are available.

### Seeding

Ensure `DATABASE_URL` and the desired seed credentials are set, then run `pnpm db:seed`. The script wipes users/todos/refresh tokens and repopulates them with:

- `demo@todo.dev` / `SEED_ADMIN_PASSWORD` – admin role with seeded sample todos
- `user1@todo.dev` / `SEED_USER_PASSWORD` – standard user without admin privileges

Use the Todo page "Show user info" button to verify which account is active; the snackbar displays the signed-in user's name and role.

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
├── tests/                 # E2E Cypress specs
├── eslint.config.mjs      # Next.js lint configuration
├── mikro-orm.config.ts    # MikroORM + Mongo connection + seeding config
├── next.config.ts         # Next.js runtime config
├── cypress.config.ts      # Cypress runner configuration
├── vitest.config.ts       # Vitest test runner configuration
└── package.json           # Scripts and dependencies
```

## Testing

The project includes unit tests with Jest and end-to-end (E2E) tests with Cypress.

### Unit Tests
Run unit tests using:
```bash
pnpm test
```

### End-to-End Tests
E2E tests are configured to run in Chrome browser. You can run them with or without HTML report generation:

- **With HTML Report**: `pnpm test:e2e` generates an HTML report at `cypress/reports/index.html` (overwrites previous reports).
- **Without Report**: `pnpm test:e2e:no-report` runs tests without generating any reports.

Reports include test results, screenshots of failures, and detailed logs. The HTML report is useful for CI/CD pipelines and manual review.

## Main Page

<img width="1963" height="1419" alt="image" src="https://github.com/user-attachments/assets/6b13ec2a-3295-46b8-8c5a-0753ccdb039a" />

## Track Status

<img width="2396" height="1868" alt="image" src="https://github.com/user-attachments/assets/2de00dae-9a42-4b6c-835c-bdd4c8f263de" />

## Agile Scram page

<img width="2424" height="1713" alt="image" src="https://github.com/user-attachments/assets/183eec4a-aa74-4714-b541-dc21103900f8" />

## Ligth mode

<img width="1965" height="1431" alt="image" src="https://github.com/user-attachments/assets/4572e2c2-d42c-448e-bc74-67a0ccdec1c0" />

## Mobile mode

<img width="1319" height="1424" alt="image" src="https://github.com/user-attachments/assets/17783e4f-6f29-4173-9422-29c5a7835947" />


