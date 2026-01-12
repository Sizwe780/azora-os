# Production Setup Runbook

## Purpose
Steps to prepare a production environment for Azora BuildSpaces: ensure database migrations are applied, Redis is configured, Sentry is enabled, and other infra is validated.

## Prerequisites
- Kubernetes cluster or server
- PostgreSQL instance (DATABASE_URL)
- Redis instance (REDIS_URL)
- Sentry project + DSN (SENTRY_DSN) and client DSN (NEXT_PUBLIC_SENTRY_DSN)
- Secrets stored in GitHub Actions or environment

## Steps
1. Ensure secrets exist in GitHub: `DATABASE_URL`, `REDIS_URL`, `SENTRY_DSN` (server), `NEXT_PUBLIC_SENTRY_DSN` (client), `NEXTAUTH_SECRET`.
2. Run CI build (see `.github/workflows/buildspaces.yml`) which will run `pnpm install`, tests, build, and optionally migrations when `DATABASE_URL` is present.
3. If running migrations locally or in a staging cluster:
   - `DATABASE_URL="postgres://..." pnpm exec prisma migrate deploy --schema=prisma/schema.prisma`
   - `DATABASE_URL="postgres://..." pnpm exec prisma generate --schema=prisma/schema.prisma`
4. Deploy the image created by CI to the target environment (K8s, Vercel, etc.).
5. Run health checks: `curl -f $APP_URL/api/health`.
6. Verify Sentry receives a test event (set `SENTRY_DSN` and trigger a test error)

## Post-deploy checks
- Confirm `audit_logs` table exists and is being written to.
- Confirm rate limiting works (set `REDIS_URL`) and sessions are stable.
- Confirm that the agent endpoints respond and constitutional audits are recorded.

## Rollback
- If migration fails, restore DB from backup snapshot and re-run migrations after fixing issues.
