#!/bin/bash

# ============================================================================
# BUILDSPACES LAUNCH VERIFICATION SCRIPT
# ============================================================================
# This script performs comprehensive pre-launch verification of Buildspaces
# against Constitutional requirements and developer laws.
# 
# Authority: Citadel Final Order
# Date: 2026-02-09
# ============================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}   BUILDSPACES LAUNCH VERIFICATION SUITE${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Initialize counters
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_WARNING=0

# ============================================================================
# Helper Functions
# ============================================================================

test_header() {
    echo ""
    echo -e "${BLUE}▶▶▶ $1${NC}"
}

test_pass() {
    echo -e "${GREEN}  ✅ $1${NC}"
    ((TESTS_PASSED++))
}

test_fail() {
    echo -e "${RED}  ❌ $1${NC}"
    ((TESTS_FAILED++))
}

test_warn() {
    echo -e "${YELLOW}  ⚠️  $1${NC}"
    ((TESTS_WARNING++))
}

# ============================================================================
# 1. ENVIRONMENT VERIFICATION
# ============================================================================

test_header "ENVIRONMENT VERIFICATION"

if [ -f ".env.local" ] || [ -f "apps/azora-buildspaces/.env.local" ]; then
    test_pass "Environment file exists"
else
    test_fail "Missing .env.local file"
fi

if [ -n "$DATABASE_URL" ] || grep -q "DATABASE_URL" apps/azora-buildspaces/.env.local 2>/dev/null; then
    test_pass "DATABASE_URL configured"
else
    test_fail "DATABASE_URL not configured"
fi

if [ -n "$NEXTAUTH_SECRET" ] || grep -q "NEXTAUTH_SECRET" apps/azora-buildspaces/.env.local 2>/dev/null; then
    test_pass "NEXTAUTH_SECRET configured"
else
    test_fail "NEXTAUTH_SECRET not configured"
fi

if grep -q "GITHUB_ID" apps/azora-buildspaces/.env.local 2>/dev/null; then
    test_pass "GitHub OAuth configured"
else
    test_warn "GitHub OAuth not configured (optional)"
fi

if grep -q "GOOGLE_CLIENT_ID" apps/azora-buildspaces/.env.local 2>/dev/null; then
    test_pass "Google OAuth configured"
else
    test_warn "Google OAuth not configured (optional)"
fi

# ============================================================================
# 2. DEPENDENCIES VERIFICATION
# ============================================================================

test_header "DEPENDENCIES VERIFICATION"

if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    test_pass "Node.js installed: $NODE_VERSION"
else
    test_fail "Node.js not found"
fi

if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    test_pass "npm installed: $NPM_VERSION"
else
    test_fail "npm not found"
fi

if [ -d "node_modules/@prisma/client" ]; then
    test_pass "Prisma client installed"
else
    test_fail "Prisma client not installed"
fi

if [ -d "node_modules/next" ]; then
    test_pass "Next.js installed"
else
    test_fail "Next.js not installed"
fi

if [ -d "node_modules/next-auth" ]; then
    test_pass "NextAuth installed"
else
    test_fail "NextAuth not installed"
fi

# ============================================================================
# 3. BUILDSPACES BUILD VERIFICATION
# ============================================================================

test_header "BUILDSPACES BUILD VERIFICATION"

cd apps/azora-buildspaces

if npm run build > /tmp/buildspaces-build.log 2>&1; then
    test_pass "Buildspaces build successful"
else
    BUILD_OUTPUT=$(cat /tmp/buildspaces-build.log | tail -20)
    test_fail "Buildspaces build failed: $BUILD_OUTPUT"
fi

cd - > /dev/null

# ============================================================================
# 4. API ENDPOINT VERIFICATION
# ============================================================================

test_header "API ENDPOINT VERIFICATION"

# Check if endpoints exist (file-based check)
endpoints=(
    "apps/azora-buildspaces/app/api/auth/[...nextauth]/route.ts"
    "apps/azora-buildspaces/app/api/auth/register/route.ts"
    "apps/azora-buildspaces/app/api/buildspaces/projects/route.ts"
    "apps/azora-buildspaces/app/api/buildspaces/execute/route.ts"
    "apps/azora-buildspaces/app/api/fs/route.ts"
    "apps/azora-buildspaces/app/api/fs/scan/route.ts"
    "apps/azora-buildspaces/app/api/design/figma-import/route.ts"
    "apps/azora-buildspaces/app/api/projects/[projectId]/git/status/route.ts"
    "apps/azora-buildspaces/app/api/projects/[projectId]/git/commit/route.ts"
)

for endpoint in "${endpoints[@]}"; do
    if [ -f "$endpoint" ]; then
        test_pass "Endpoint exists: $endpoint"
    else
        test_fail "Endpoint missing: $endpoint"
    fi
done

# ============================================================================
# 5. AUTHENTICATION VERIFICATION
# ============================================================================

test_header "AUTHENTICATION VERIFICATION"

auth_file="apps/azora-buildspaces/lib/auth.ts"

if grep -q "CredentialsProvider" "$auth_file"; then
    test_pass "Email/password auth configured"
else
    test_warn "Credentials provider not found"
fi

if grep -q "GitHubProvider" "$auth_file"; then
    test_pass "GitHub OAuth configured in auth.ts"
else
    test_warn "GitHub OAuth not configured in auth.ts"
fi

if grep -q "GoogleProvider" "$auth_file"; then
    test_pass "Google OAuth configured in auth.ts"
else
    test_warn "Google OAuth not configured in auth.ts"
fi

if grep -q "getServerSession" "apps/azora-buildspaces/app/api/fs/route.ts"; then
    test_pass "Auth guard on /api/fs"
else
    test_fail "Missing auth guard on /api/fs"
fi

if grep -q "getServerSession" "apps/azora-buildspaces/app/api/fs/scan/route.ts"; then
    test_pass "Auth guard on /api/fs/scan"
else
    test_fail "Missing auth guard on /api/fs/scan"
fi

# ============================================================================
# 6. DATABASE SCHEMA VERIFICATION
# ============================================================================

test_header "DATABASE SCHEMA VERIFICATION"

schema_file="prisma/schema.prisma"

if grep -q "model BuildSpaceProject" "$schema_file"; then
    test_pass "BuildSpaceProject model defined"
else
    test_fail "BuildSpaceProject model missing"
fi

if grep -q "model BuildSpaceSpec" "$schema_file"; then
    test_pass "BuildSpaceSpec model defined"
else
    test_fail "BuildSpaceSpec model missing"
fi

if grep -q "model BuildSpaceExecution" "$schema_file"; then
    test_pass "BuildSpaceExecution model defined"
else
    test_fail "BuildSpaceExecution model missing"
fi

if grep -q "datasource db {" "$schema_file"; then
    test_pass "Datasource configured"
else
    test_fail "Datasource not configured"
fi

# ============================================================================
# 7. CONSTITUTIONAL COMPLIANCE
# ============================================================================

test_header "CONSTITUTIONAL COMPLIANCE"

# Check for mock implementations
if grep -r "TODO\|STUB\|MOCK\|fake\|placeholder" apps/azora-buildspaces/lib --include="*.ts" 2>/dev/null | grep -v "node_modules" | wc -l | grep -q "^0$"; then
    test_pass "No mock implementations found"
else
    MOCK_COUNT=$(grep -r "TODO\|STUB\|MOCK\|fake\|placeholder" apps/azora-buildspaces/lib --include="*.ts" 2>/dev/null | grep -v "node_modules" | wc -l)
    test_warn "Found $MOCK_COUNT potential mock implementations (verify manually)"
fi

# Check for auth guards in critical endpoints
if grep -q "getServerSession\|requireAuth\|withAuth" apps/azora-buildspaces/app/api/buildspaces/execute/route.ts; then
    test_pass "Code execution endpoint authenticated"
else
    test_fail "Code execution endpoint NOT authenticated"
fi

# ============================================================================
# 8. WORKSPACE COMPONENT VERIFICATION
# ============================================================================

test_header "WORKSPACE COMPONENT VERIFICATION"

workspace_files=(
    "apps/azora-buildspaces/app/workspace/page.tsx"
    "apps/azora-buildspaces/components/workspace/workspace-header.tsx"
    "apps/azora-buildspaces/components/workspace/workspace-sidebar.tsx"
    "apps/azora-buildspaces/components/rooms/code-chamber.tsx"
    "apps/azora-buildspaces/components/rooms/spec-chamber.tsx"
)

for file in "${workspace_files[@]}"; do
    if [ -f "$file" ]; then
        test_pass "Component exists: ${file##*/}"
    else
        test_warn "Component missing: ${file##*/}"
    fi
done

# ============================================================================
# SUMMARY
# ============================================================================

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}   VERIFICATION SUMMARY${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

TOTAL=$((TESTS_PASSED + TESTS_FAILED + TESTS_WARNING))

echo -e "  ${GREEN}✅ Passed:  $TESTS_PASSED${NC}"
echo -e "  ${RED}❌ Failed:  $TESTS_FAILED${NC}"
echo -e "  ${YELLOW}⚠️  Warnings: $TESTS_WARNING${NC}"
echo ""
echo -e "  Total:   $TOTAL tests"
echo ""

PASS_RATE=$((TESTS_PASSED * 100 / TOTAL))
echo -e "  Pass Rate: ${PASS_RATE}%"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ LAUNCH READY${NC}"
    echo ""
    echo -e "${GREEN}Verification Status: PASSED${NC}"
    exit 0
elif [ $TESTS_FAILED -le 3 ]; then
    echo -e "${YELLOW}⚠️  CONDITIONAL READY${NC}"
    echo ""
    echo -e "${YELLOW}Verification Status: CONDITIONAL (Fix $TESTS_FAILED critical issues)${NC}"
    exit 1
else
    echo -e "${RED}❌ NOT READY FOR LAUNCH${NC}"
    echo ""
    echo -e "${RED}Verification Status: FAILED ($TESTS_FAILED critical issues)${NC}"
    exit 2
fi
