# Remaining Unprotected Endpoints - Action Items

## ⚠️ ENDPOINTS STILL NEEDING AUTH PROTECTION (5 Critical)

All of these are in buildspaces and need `getServerSession` + auth check added:

---

### 1. **`POST /api/design/figma-import`**
**Purpose**: Import design from Figma  
**Risk**: Design data exposure, unauthorized imports  
**Fix**: Add session check (2 min)

```typescript
// Add at top of file:
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Add in POST handler before processing:
const session = await getServerSession(authOptions);
if (!session || !session.user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```
**File**: `/apps/azora-buildspaces/app/api/design/figma-import/route.ts`

---

### 2. **`POST /api/fs/scan`**
**Purpose**: Scan filesystem for files  
**Risk**: Directory traversal, unauthorized file access  
**Fix**: Add session check (2 min)

```typescript
// Same pattern as above
```
**File**: `/apps/azora-buildspaces/app/api/fs/scan/route.ts`

---

### 3. **`GET /api/metrics`**
**Purpose**: Prometheus metrics endpoint  
**Risk** (Low): Metrics are informational but could reveal infrastructure  
**Fix**: Add session check or make health-check specific (existing code has odd corruption)

Currently has malformed code from patch. Need to restore proper structure and add auth.

**File**: `/apps/azora-buildspaces/app/api/metrics/route.ts`

---

### 4. **`GET /api/fs`**
**Purpose**: List filesystem  
**Risk**: Unauthorized filesystem access  
**Fix**: Add session check (2 min)

**File**: `/apps/azora-buildspaces/app/api/fs/route.ts`

---

### 5. **Git Operations** (3 endpoints)
**Purpose**: Git commit, push, status  
**Risk**: Code manipulation, unauthorized commits  
**Fix**: Add session check to all 3

Files:
- `/apps/azora-buildspaces/app/api/projects/[projectId]/git/status/route.ts`
- `/apps/azora-buildspaces/app/api/projects/[projectId]/git/commit/route.ts`
- `/apps/azora-buildspaces/app/api/projects/[projectId]/git/push/route.ts`

---

## 📝 BATCH REPLACEMENT TEMPLATE

For each file, apply this pattern:

```typescript
// BEFORE:
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    // ... handler code

// AFTER:
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    // SECURITY: Require authentication
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await req.json()
    // ... handler code
```

---

## ✅ VERIFICATION CHECKLIST

After protecting each endpoint, verify:

```bash
# Test without auth (should fail):
curl -X POST http://localhost:3000/api/design/figma-import \
  -H "Content-Type: application/json" \
  -d '{}' 
# Expected: 401 Unauthorized

# Test with auth (should work):
curl -X POST http://localhost:3000/api/design/figma-import \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=..." \
  -d '{"figmaUrl":"..."}'
# Expected: 200 or 400 (process the request)
```

---

## 🔧 QUICK IMPLEMENTATION (Total Time: 15 minutes)

1. **Fix `/api/metrics` corruption** (3 min)
   - Restore interface definition
   - Remove stray code block
   - Add proper auth check

2. **Protect `/api/design/figma-import`** (2 min)
   - Copy template below
   - Paste at start of POST handler

3. **Protect `/api/fs/*` endpoints** (4 min)
   - Apply to `/fs/scan`
   - Apply to `/fs`

4. **Protect git endpoints** (4 min)
   - Apply to `git/status`
   - Apply to `git/commit`
   - Apply to `git/push`

5. **Verify all endpoints** (2 min)
   - Test without session → 401
   - Test with session → actual endpoint behavior

---

## 🚨 CRITICAL: After Protection

These endpoints now require valid NextAuth session. Ensure:

1. ✅ Frontend has auth token in cookies
2. ✅ Session is fresh (not expired)
3. ✅ User logged in before accessing
4. ✅ Cross-CSRF protection is working
5. ✅ Rate limiting is applied (if needed)

---

## Priority Order (Do In This Order)

1. **git endpoints** (most critical - code changes)
2. **design/figma-import** (data exposure risk)
3. **fs operations** (filesystem access risk)
4. **metrics** (fix corruption first)

Total estimated time: **15-20 minutes**
