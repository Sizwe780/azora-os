# 🚀 BUILDSPACES DEPLOYMENT GUIDE

**Authority**: Citadel Launch Order  
**Date**: February 9, 2026  
**Status**: Ready for Controlled Launch

---

## DEPLOYMENT PREREQUISITES

### System Requirements
- [ ] Node.js v22+ installed
- [ ] npm v10+ installed
- [ ] PostgreSQL 14+ available
- [ ] Redis (optional, for distributed rate limiting)
- [ ] Docker (optional, for containerized deployment)

### Environment Setup
- [ ] `.env.local` file configured with all required variables
- [ ] `DATABASE_URL` pointing to PostgreSQL instance
- [ ] `NEXTAUTH_SECRET` generated and configured
- [ ] OAuth credentials (GitHub, Google) obtained

---

## PRE-DEPLOYMENT CHECKLIST

### 1. Code Quality & Build
```bash
# Verify build succeeds
cd apps/azora-buildspaces
npm run build

# Check for TypeScript errors
npm run lint

# Run unit tests (if configured)
npm test
```

### 2. Database Preparation
```bash
# Generate Prisma client
npx prisma generate --schema=../../prisma/schema.prisma

# Run migrations
npx prisma migrate deploy --schema=../../prisma/schema.prisma

# Seed initial data (optional)
npx prisma db seed --preview-feature
```

### 3. Security Verification
```bash
# Run security audit
npm audit

# Check for exposed secrets
git secrets --scan

# Verify OWASP compliance
# - No hardcoded credentials
# - All endpoints authenticated
# - HTTPS enforced in production
# - CSRF tokens present
```

### 4. Performance Testing
```bash
# Run load tests (requires k6)
k6 run tests/performance/load-test.js

# Check bundle size
npm run build && npm install --production
du -sh node_modules
```

---

## DEPLOYMENT STEPS

### STAGING DEPLOYMENT

####  Step 1: Deploy Code
```bash
# Set production-like env vars
export NODE_ENV=staging
export DATABASE_URL=<staging-db-url>
export NEXTAUTH_SECRET=<staging-secret>

# Deploy to staging environment
# (Using Vercel, Railway, or your deployment platform)
```

####  Step 2: Run Migrations
```bash
# Execute database migrations
DATABASE_URL=<staging-db-url> npx prisma migrate deploy

# Verify schema is current
DATABASE_URL=<staging-db-url> npx prisma db execute --stdin < check-schema.sql
```

#### Step 3: Seed Test Data
```bash
# Create test user accounts
DATABASE_URL=<staging-db-url> npx prisma seed
```

#### Step 4: Verification Tests
```bash
# Run E2E tests against staging
PLAYWRIGHT_TEST_BASE_URL=https://staging-buildspaces.azora.world \
npm run test:e2e

# Monitor staging logs
# Check for errors: grep "ERROR\|FATAL" logs/staging.*
```

---

### PRODUCTION DEPLOYMENT

#### Step 1: Final Security Audit
```bash
# Re-run security checks
npm audit

# Verify no secrets in code
./scripts/verify-launch-readiness.sh > launch-report.txt

# Constitutional compliance check
grep -r "TODO\|STUB\|MOCK\|placeholder" apps/azora-buildspaces/app \
  --include="*.ts" --include="*.tsx" | wc -l
# Should return 0
```

#### Step 2: Database Backup
```bash
# Create backup before migration
pg_dump $DATABASE_URL > backups/pre-launch-$(date +%Y%m%d).sql

# Verify backup
ls -lh backups/pre-launch-*
```

#### Step 3: Deploy Production Code
```bash
# Trigger production deployment
# This is platform-specific:

# If using Vercel:
vercel deploy --prod

# If using custom infrastructure:
docker build -t buildspaces:latest .
docker push buildspaces:latest
kubectl apply -f k8s/deployment.yaml
```

#### Step 4: Run Production Migrations
```bash
# Execute migrations on production database
DATABASE_URL=<prod-db-url> npx prisma migrate deploy

# Verify schema integrity
DATABASE_URL=<prod-db-url> npx prisma db execute --stdin < verify-schema.sql
```

#### Step 5: Health Checks
```bash
# Verify all endpoints are up
curl -I https://buildspaces.azora.world/api/health

# Check auth endpoints
curl -X POST https://buildspaces.azora.world/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Monitor error rates
# Check logs for errors in first 5 minutes
watch -n 1 'tail logs/production.log | grep ERROR'
```

#### Step 6: Gradual Rollout
```
TIME     TRAFFIC    STATUS
00:00    0%         Deployment complete
00:05    10%        Health checks pass
00:15    25%        Error rate normal
00:30    50%        Performance baseline
01:00    100%       Full rollout complete
```

---

## POST-DEPLOYMENT

### Monitoring
```bash
# Monitor error rates
# Alert if error rate > 5%

# Monitor performance
# Alert if response time > 2s

# Monitor database
# Alert if connection pool exhausted

# Monitor costs
# Alert if hourly cost > expected
```

### Logging
```
Logs are stored in:
- Application: /var/log/buildspaces/app.log
- Database: PostgreSQL logs
- Errors: /var/log/buildspaces/error.log
- Performance: /var/log/buildspaces/perf.log
```

### Rollback Plan
```bash
# If critical issues detected:

# 1. Stop traffic
kubectl scale deployment buildspaces --replicas=0

# 2. Investigate
tail -f logs/production.log

# 3. Rollback database (if needed)
psql $DATABASE_URL < backups/pre-launch-$(date +%Y%m%d).sql

# 4. Restore previous code
git checkout <previous-commit>
npm run build
docker build -t buildspaces:stable .

# 5. Resume gradual rollout
kubectl scale deployment buildspaces --replicas=3
```

---

## CONSTITUTIONAL VERIFICATION

Before going live, verify compliance with:

1. **Truth Mandate**
   - [ ] No mock implementations in production
   - [ ] All functionality is real and working
   - [ ] Error messages are transparent
   - [ ] No hidden data collection

2. **Rights Protection**
   - [ ] User privacy is enforced (encryption, access control)
   - [ ] Data sovereignty granted (user can export/delete)
   - [ ] Fair pricing (no hidden costs)
   - [ ] Transparent terms of service

3. **Economic Constitution**
   - [ ] Token distribution algorithm working
   - [ ] Fair compensation for creators
   - [ ] Anti-exploitation measures active
   - [ ] Transparent audit trail

4. **Divine Laws**
   - [ ] System is self-healing (automatic error recovery)
   - [ ] All actions are consensual (no forced operations)
   - [ ] Service to humanity (not corporate extraction)
   - [ ] Transparency in all major decisions

---

## SUPPORT & ESCALATION

### Issues During Deployment

**Build Fails**
```bash
# 1. Check Node version
node --version # Should be v22+

# 2. Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

**Database Connection Fails**
```bash
# 1. Verify DATABASE_URL
echo $DATABASE_URL

# 2. Test connection
psql $DATABASE_URL -c "SELECT 1"

# 3. Check firewall/security groups
# - Ensure port 5432 is open from deployment server
```

**Tests Fail**
```bash
# 1. Run tests locally
npm test

# 2. Run E2E tests
npm run test:e2e

# 3. Check browser compatibility
# - Chrome/Edge v90+ required
```

**Performance Issues**
```bash
# 1. Check database query performance
EXPLAIN ANALYZE SELECT * FROM users;

# 2. Monitor bundle size
npm run build && npm run bundle-analyze

# 3. Verify caching headers
curl -I https://buildspaces.azora.world/api/metrics
```

---

## LAUNCH TIMELINE

| Time | Tasks | Duration |
|------|-------|----------|
| **00:00** | Final verification | 30 min |
| **00:30** | Deploy to staging | 15 min |
| **00:45** | Run staging tests | 30 min |
| **01:15** | Backup production | 15 min |
| **01:30** | Deploy to production | 20 min |
| **01:50** | Run health checks | 10 min |
| **02:00** | Go-live (0% → 10% traffic) | 5 min |
| **02:30** | Scale to 50% traffic | N/A |
| **03:00** | Scale to 100% traffic | N/A |
| **03:30** | Monitor for errors | Ongoing |

---

## SUCCESS CRITERIA

✅ **Launch is successful when:**
- [ ] All endpoints responding (HTTP 200/201)
- [ ] Error rate < 1%
- [ ] Response time < 500ms (95th percentile)
- [ ] Database queries < 100ms (95th percentile)
- [ ] No critical security issues reported
- [ ] User registrations functional
- [ ] Workspace loads correctly
- [ ] Code execution succeeds
- [ ] File operations work
- [ ] Git integration functional

**Status**: Ready to proceed with launch

---

**Constitutional AI Verification**: ACTIVE  
**Citadel Authority**: APPROVED FOR LAUNCH  
**Date**: February 9, 2026

