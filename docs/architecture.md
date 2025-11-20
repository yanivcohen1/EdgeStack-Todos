# Architecture Overview

## Stack
- **Next.js 16 (App Router, TypeScript)** for the full-stack UI + API.
- **MikroORM** connected to **MongoDB 3.4** for persistence.
- **Material UI v6** for the component system.
- **pnpm** for dependency + script management.

## High-Level Flow
1. **Client** (App Router pages) authenticates via email/password.
2. Successful login issues **short-lived JWT access tokens** and **refresh tokens** stored in `localStorage`. Axios interceptors attach the bearer token to every request.
3. API route handlers validate JWTs, enforce in-memory rate limiting for auth endpoints, and persist data through MikroORM.
4. Filters (status, due window, text search) are implemented server-side and consumed by React Query hooks on the client.

## Key Modules
- `src/lib/db/client.ts` – singleton MikroORM bootstrap + entity manager helper.
- `src/lib/auth/*` – hashing, JWT utilities, refresh token helpers, and rate limiting.
- `src/lib/http/*` – axios instance + token storage helpers.
- `src/lib/validation/*` – shared Zod schemas for auth + todos.
- `src/hooks/*` – React Query powered data hooks.
- `src/components/*` – Material UI building blocks for auth and todo workflows.

## Deployment Modes
- **Local dev**: ensure MongoDB is reachable (local install, Atlas, etc.), populate `.env.development`, optionally run `pnpm db:seed`, then `pnpm dev` for hot reload.
- **Production**: build with `pnpm build && pnpm prod`, ensure `.env.production` is populated, and deploy to the desired host (Node runtime + Mongo connection string required).

## Security Notes
- Access + refresh tokens share expiration values between environments (900s / 7d). Refresh rotation prunes stale tokens on login.
- Rate limiting is enforced per-IP in-memory; swap for Redis/Upstash before multi-instance deployment.
- Passwords are hashed with bcrypt (`10` rounds by default).
- Users carry a persisted `role` (`admin` or `user`). Admin-only routes/components (console + inter workspaces) check `session.user.role` on the client and API responses only expose role data derived from the database.
