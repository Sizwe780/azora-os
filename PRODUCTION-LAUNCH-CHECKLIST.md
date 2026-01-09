# 🚀 BuildSpaces Production Launch Checklist

> **Scope:** BuildSpaces stack (Next.js 16 + Monaco + Prisma + WebContainer + Yjs)  
> **Total items:** 110 (35 critical, 18 high, 9 medium, 10 low priority)  
> **Timeline:** 7 sprints mapped to a 13-week schedule

## Priority Summary

| Priority | Count | Examples |
| --- | --- | --- |
| Critical | 35 | Docker image, health endpoints, Jest config, rate limiter, security headers, mock data removal |
| High | 18 | K8s readiness/liveness, TLS, CI coverage, k6 load baseline |
| Medium | 9 | Bundle optimizations, caching hints, logging parity |
| Low | 10 | Docs polish, demo data refresh |

## Category Breakdown (110 actionable items)
- **Infrastructure (15)**: containerization, K8s deployment, ingress, TLS, autoscaling, resource limits, readiness/liveness, blue/green toggles, secrets management.
- **Testing (12)**: Jest config, unit >80% target, integration API coverage, Playwright smoke, contract tests for Code Chamber API, snapshot for Monaco configs, accessibility smoke, regression matrix, coverage gating in CI, flaky test quarantine, k6 scripts, nightly runs.
- **Security (15)**: security headers, CSP, rate limiter, auth enforcement, input validation, dependency scan, SAST, secret scanning, TLS, signed images, SBOM, CVE policy, session hardening, CORS, audit logging.
- **Mock data (6)**: Command Desk, Knowledge Ocean, Design Studio, AI Studio, Maker Lab, demo pages—replace with DB/API backed loaders and fallback states.
- **Monitoring (10)**: uptime checks, p95<3s SLO, error budgets, tracing, structured logs, log retention, alerts to on-call, dashboards (latency, errors, saturation), synthetic checks, RUM opt-in.
- **Database (8)**: migrations validated, Prisma schema review, backups, PITR, index audit, connection pooling, seed scripts, data masking for non-prod.
- **CI/CD (6)**: pipeline stages (lint/test/build/scan/deploy), artifact retention, environment promotion gates, rollout strategy, rollback plan, tag/versioning.
- **Documentation (6)**: README production section, runbooks, on-call playbook, API docs, architecture diagram, demo handoff notes.

## Acceptance Criteria (samples per category)
- **Bundle**: client bundle < 500KB gz (critical).
- **Coverage**: overall test coverage ≥ 80%, critical paths ≥ 90%.
- **Latency**: p95 < 3s for room join and file open.
- **Availability**: 99.5% uptime target with health endpoints.
- **Security**: no critical/high CVEs; rate limiter caps at 100 rps/service; security headers score A on Mozilla Observatory.
- **Data**: zero mock data in production paths; fallbacks show loaders not static seeds.

## Detailed Checklist

### Infrastructure (15)
- [ ] **Dockerfile** multi-stage build (critical) — image ≤ 500MB.
- [ ] **Entrypoint health**: `/healthz` + `/readyz` (critical) — 200 OK within 150ms.
- [ ] **K8s manifests** validated against schema (critical) — `kubectl apply --server-dry-run`.
- [ ] **Ingress + TLS** via cert-manager (high) — auto-renew >=30d.
- [ ] **Resource limits/requests** set (high) — CPU/Memory per pod defined.
- [ ] **HPA** based on CPU/latency (medium) — min 2 replicas.
- [ ] **Config via env/secrets** (critical) — no secrets in image.
- [ ] **Blue/green toggle** documented (medium).
- [ ] **Artifact registry** with provenance (high).
- [ ] **Node 20 base image** pin (critical).
- [ ] **Prisma migration step** baked into release (high).
- [ ] **Static assets caching** headers (medium).
- [ ] **CDN in front of Next.js** documented (medium).
- [ ] **Rollback command** verified (high).
- [ ] **Disaster recovery RPO/RTO** noted (medium).

### Testing (12)
- [ ] **Jest config** exists and passes smoke suite (critical).
- [ ] **Unit coverage ≥80%** (high) — enforce in CI.
- [ ] **Critical path ≥90%** (critical) — room join, file open, save.
- [ ] **Integration tests** for API routes (high).
- [ ] **Playwright smoke** for room load + terminal ready (high).
- [ ] **Contract tests** for Code Chamber API (medium).
- [ ] **Accessibility smoke** (medium).
- [ ] **Snapshot tests** for Monaco config (low).
- [ ] **Flaky quarantine** process (low).
- [ ] **Coverage gating** in CI (high).
- [ ] **k6 baseline** 100 concurrent users (medium).
- [ ] **Nightly test run** scheduled (low).

### Security (15)
- [ ] **Security headers** (critical) — CSP, HSTS, X-Frame-Options, X-Content-Type-Options.
- [ ] **Rate limiter** (critical) — 100 rps/service default.
- [ ] **Input validation** on API routes (critical).
- [ ] **Auth enforcement** on protected rooms (critical).
- [ ] **Dependency scanning** (high) — automated.
- [ ] **SAST** (high).
- [ ] **Secret scanning** (high).
- [ ] **TLS everywhere** (high).
- [ ] **Signed images/SBOM** (medium).
- [ ] **CORS policy** locked to allowed origins (medium).
- [ ] **Session hardening** (medium).
- [ ] **Audit logging** for admin actions (medium).
- [ ] **CVE SLA**: critical 24h, high 72h (medium).
- [ ] **DoS protections** at ingress (critical).
- [ ] **Data encryption at rest** verified (medium).

### Mock Data Removal (6)
- [ ] **Command Desk** loads from `/api/chat/sessions/current/messages`.
- [ ] **Knowledge Ocean** uses DB-backed vector search.
- [ ] **Design Studio** pulls live project data.
- [ ] **AI Studio** uses real agent configs.
- [ ] **Maker Lab** fetches maker projects list.
- [ ] **Demo pages** reference sample data via API, not hard-coded arrays.

### Monitoring & Observability (10)
- [ ] **Uptime checks** for web + API (high).
- [ ] **p95 latency dashboard** (<3s) (critical).
- [ ] **Error budget** tracking (medium).
- [ ] **Tracing** (high) — traceparent propagation.
- [ ] **Structured logging** with correlation IDs (high).
- [ ] **Log retention** policy (medium).
- [ ] **Alerting** to on-call within 5 min (critical).
- [ ] **Synthetic checks** for room join (medium).
- [ ] **RUM opt-in** for client metrics (low).
- [ ] **Capacity report** weekly (low).

### Database (8)
- [ ] **Prisma migrations** applied per environment (critical).
- [ ] **Backups** daily + restore test monthly (high).
- [ ] **PITR** enabled where supported (high).
- [ ] **Index audit** for slow queries (medium).
- [ ] **Connection pooling** via PG bouncer (medium).
- [ ] **Seed scripts** for non-prod without mock violations (medium).
- [ ] **Data masking** for staging (medium).
- [ ] **Migration rollback** plan (high).

### CI/CD (6)
- [ ] **Pipelines**: lint → test → build → scan → deploy (critical).
- [ ] **Artifacts** stored with retention (medium).
- [ ] **Promotion gates** staging → prod with approvals (high).
- [ ] **Rollout strategy** canary/blue-green (high).
- [ ] **Rollback** scripted (high).
- [ ] **Versioning/tags** applied per release (medium).

### Documentation (6)
- [ ] **README production** section updated (high).
- [ ] **Runbooks** for incidents (medium).
- [ ] **On-call playbook** with escalation (medium).
- [ ] **API docs** for BuildSpaces routes (medium).
- [ ] **Architecture diagram** current (medium).
- [ ] **Demo handoff** notes (low).

## 7-Sprint / 13-Week Timeline
1. **Sprint 1-2 (Weeks 1-3)**: Dockerfile, health checks, Jest config, security headers, rate limiter.
2. **Sprint 3 (Weeks 4-5)**: Mock data removal, API loaders, DB seeding.
3. **Sprint 4 (Weeks 6-7)**: Testing expansion (unit/integration/Playwright), coverage gates.
4. **Sprint 5 (Weeks 8-9)**: Observability dashboards, alerts, k6 baseline.
5. **Sprint 6 (Weeks 10-11)**: CI/CD hardening, signed images, SBOM.
6. **Sprint 7 (Weeks 12-13)**: Final DR drills, rollback rehearsal, launch readiness review.

## Acceptance Review
- All critical items checked.
- p95 latency <3s sustained in staging under 100 concurrent users.
- Coverage thresholds enforced.
- No mock data in production code paths.
- Launch review sign-off from engineering, security, and ops.
