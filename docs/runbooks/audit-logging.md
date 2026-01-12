# Audit Logging Runbook

## Purpose
Details on the audit logging system used to capture constitutional audits and critical system events.

## Components
- `apps/azora-buildspaces/lib/audit-logger.ts` — in-memory and Prisma persistence
- `prisma/migrations/001_add_audit_log/migration.sql` — migration to create `audit_logs` table
- Sentry integration for critical errors (configured via `SENTRY_DSN`)

## How it works
- Audit logger writes to an in-memory buffer and persists to `audit_logs` if `DATABASE_URL` is set.
- For `ERROR` and `CRITICAL` severities, messages are forwarded to Sentry when `SENTRY_DSN` is set.

## Troubleshooting
- If logs are not in the DB: verify `DATABASE_URL`, and run migrations: `pnpm exec prisma migrate deploy --schema=prisma/schema.prisma`.
- If Sentry is not receiving events: verify `SENTRY_DSN` and ensure the DSN configured is correct.

## Operational checks
- `SELECT COUNT(*) FROM audit_logs WHERE timestamp > now() - interval '1 day'` should return recent events.
- Monitor alerts for `AuditSeverity.CRITICAL` and create PagerDuty/SNS hooks if needed.
