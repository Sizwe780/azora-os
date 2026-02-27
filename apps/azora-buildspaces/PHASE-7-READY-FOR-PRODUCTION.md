# Phase 7: Ready-for-Production Checklist

## ✅ FEATURE IMPLEMENTATION

- [x] Firestore persistence layer (`lib/agents/persistence.ts`)
  - 12 new functions for trace/file/session management
  - 150+ lines of production-grade code
  
- [x] Tool integration (write_file, design_to_code)
  - Optional `projectId` parameter
  - Automatic Firestore sync on execution
  
- [x] API Routes (3 new)
  - `GET /api/projects/[projectId]/snapshot`
  - `GET /api/agents/sessions`
  - `GET /api/agents/sessions/[executionId]`
  
- [x] File System Hydration
  - `buildFileMapFromSnapshot()` helper
  - Integrated into `loadProject()` flow
  
- [x] UI Enhancements
  - CodeChamber: ProjectId derivation + localStorage persistence
  - CommandDesk: Recent sessions list + Resume button
  - ReasoningTrace: Green sync dot indicator
  
- [x] Stream Route Enhancement
  - `upsertExecutionRecord()` on stream start

## ✅ TEST COVERAGE

- [x] persistence.test.ts: 3/3 PASS
  - syncTraceToFirestore (step append)
  - syncFileToFirestore (individual file)
  - syncFileSystemSnapshot (batch write)
  
- [x] orchestrator-real.test.ts: 4/4 PASS
  - File write + trace emission
  - Tool execution validation
  
- [x] stream-route.test.ts: 1/1 PASS
  - Trace replay + ExecutionRecord
  
- [x] reasoning-trace.test.tsx: 17/17 PASS
  - Sync dot rendering + integration

**Total: 25/25 tests PASS ✓**

## ⏳ STAGING VALIDATION (Next Steps)

**Prerequisite:** Obtain `FIREBASE_SERVICE_ACCOUNT_JSON` from GCP

```bash
# 1. Set env var (replace with actual path)
export FIREBASE_SERVICE_ACCOUNT_JSON="$(cat /path/to/service-account.json)"

# 2. Navigate to buildspaces app
cd apps/azora-buildspaces

# 3. Run full test suite (all should still pass)
pnpm test

# 4. Run E2E test (currently skipped, will run with env var set)
pnpm exec playwright test tests/e2e/phoenix-resume.spec.ts

# 5. Manual smoke test:
#    - Start: pnpm dev
#    - Go to http://localhost:3000
#    - Send a prompt in CommandDesk
#    - Wait for trace to appear
#    - Verify green sync dot visible
#    - Hard refresh (Cmd+Shift+R)
#    - Verify trace rehydrated
#    - Verify Recent Sessions shows session in sidebar
#    - Click Resume → should load full context
```

## 🔐 SECURITY AUDIT CHECKLIST

Before production flip, verify:

- [ ] No hardcoded Firebase credentials in source
- [ ] `FIREBASE_SERVICE_ACCOUNT_JSON` only from environment
- [ ] Firestore security rules configured (if any)
- [ ] API routes have auth guards (if needed)
- [ ] Git history clean (no leaked keys)
- [ ] `CONSTITUTION.md` compliance maintained
- [ ] `AI_DEV_LAWS.md` principles followed

## 📋 PRODUCTION DEPLOYMENT

Once all above pass:

1. Set `FIREBASE_SERVICE_ACCOUNT_JSON` in production environment
2. Deploy latest code
3. Monitor Firestore usage/costs
4. Verify green sync dots in production sessions
5. Set status: **🟢 PRODUCTION READY**

## 📖 DOCUMENTATION REFERENCES

- Architecture: `PHASE-7-COMPLETION-SUMMARY.md` (this repo)
- Component Integration: `lib/agents/persistence.ts` (function docs)
- E2E Test: `tests/e2e/phoenix-resume.spec.ts`
- Firestore Schema: See `persistence.ts` type definitions

## 💡 QUICK COMMAND REFERENCE

```bash
# Run all persistence-related tests
pnpm exec jest tests/lib/persistence.test.ts \
  tests/lib/orchestrator-real.test.ts \
  tests/lib/agents/stream-route.test.ts \
  tests/components/reasoning-trace.test.tsx \
  --runInBand

# Run E2E test (requires FIREBASE_SERVICE_ACCOUNT_JSON)
FIREBASE_SERVICE_ACCOUNT_JSON="$(cat ./service-account.json)" \
  pnpm exec playwright test tests/e2e/phoenix-resume.spec.ts

# Dev server with persistence enabled
FIREBASE_SERVICE_ACCOUNT_JSON="$(cat ./service-account.json)" \
  pnpm dev
```

## 🎯 SUCCESS CRITERIA

**Phase 7 is complete when:**
- [x] All tests pass (25/25)
- [x] Code review complete
- [x] No lint errors
- [ ] Staging validation passes (requires Firebase creds)
- [ ] Security audit passes
- [ ] E2E test runs successfully (requires Firebase creds)
- [ ] Production ready notification sent

---

**Status: READY FOR STAGING → SECURITY AUDIT → PRODUCTION**

Last Updated: 2025-01-24
Test Results: 25/25 PASS
Estimated Time to Production: <4 hours (Firebase creds available)
