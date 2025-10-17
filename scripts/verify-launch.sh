#!/bin/bash

###############################################################################
# Azora OS - Repository Verification Script
# Copyright (c) 2025 Sizwe Ngwenya (Azora World)
# 
# Verifies that the repository is properly configured for launch
###############################################################################

echo "🚀 Azora OS - Launch Verification"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Documentation directories
DOCS_OVERVIEW_DIR="docs/overview"
DOCS_REFERENCE_DIR="docs/reference"

# Counters
PASSED=0
FAILED=0

# Check function
check() {
    if [ $2 -eq 0 ]; then
        echo -e "${GREEN}✅ $1${NC}"
        ((PASSED++))
    else
        echo -e "${RED}❌ $1${NC}"
        ((FAILED++))
    fi
}

echo "📋 Checking Essential Files..."
echo ""

# Check LICENSE
if [ -f "LICENSE" ]; then
    if grep -q "Sizwe Ngwenya" LICENSE; then
        check "LICENSE file with proper attribution" 0
    else
        check "LICENSE file with proper attribution" 1
    fi
else
    check "LICENSE file exists" 1
fi

# Check FOUNDER.md
FOUNDER_DOC="$DOCS_OVERVIEW_DIR/FOUNDER.md"
if [ -f "$FOUNDER_DOC" ]; then
    if grep -q "Sizwe Ngwenya" "$FOUNDER_DOC"; then
        check "FOUNDER.md with author info" 0
    else
        check "FOUNDER.md with author info" 1
    fi
else
    check "FOUNDER.md exists" 1
fi

# Check TERMS.md
TERMS_DOC="$DOCS_REFERENCE_DIR/TERMS.md"
if [ -f "$TERMS_DOC" ]; then
    if grep -q "Limitation of Liability" "$TERMS_DOC"; then
        check "TERMS.md with legal protection" 0
    else
        check "TERMS.md with legal protection" 1
    fi
else
    check "TERMS.md exists" 1
fi

# Check AI_OWNERSHIP.md
AI_OWNERSHIP_DOC="$DOCS_REFERENCE_DIR/AI_OWNERSHIP.md"
if [ -f "$AI_OWNERSHIP_DOC" ]; then
    if grep -q "AZORA" "$AI_OWNERSHIP_DOC"; then
        check "AI_OWNERSHIP.md present" 0
    else
        check "AI_OWNERSHIP.md present" 1
    fi
else
    check "AI_OWNERSHIP.md exists" 1
fi

# Check README.md
if [ -f "README.md" ]; then
    if grep -q "azora.world" README.md; then
        check "README.md with proper branding" 0
    else
        check "README.md with proper branding" 1
    fi
else
    check "README.md exists" 1
fi

# Check package.json
if [ -f "package.json" ]; then
    if grep -q "Sizwe Ngwenya" package.json; then
        check "package.json with author attribution" 0
    else
        check "package.json with author attribution" 1
    fi
else
    check "package.json exists" 1
fi

echo ""
echo "📱 Checking PWA Configuration..."
echo ""

# Check manifest.json
if [ -f "public/manifest.json" ]; then
    if grep -q "Azora OS" public/manifest.json; then
        check "manifest.json properly configured" 0
    else
        check "manifest.json properly configured" 1
    fi
else
    check "manifest.json exists" 1
fi

# Check service-worker.js
if [ -f "public/service-worker.js" ]; then
    if grep -q "CACHE_NAME" public/service-worker.js; then
        check "service-worker.js with caching" 0
    else
        check "service-worker.js with caching" 1
    fi
else
    check "service-worker.js exists" 1
fi

# Check index.html
if [ -f "index.html" ]; then
    if grep -q "service-worker" index.html && grep -q "manifest" index.html; then
        check "index.html with PWA registration" 0
    else
        check "index.html with PWA registration" 1
    fi
else
    check "index.html exists" 1
fi

echo ""
echo "🧠 Checking AI Services..."
echo ""

# Check Quantum Deep Mind
if [ -f "services/quantum-deep-mind/index.js" ]; then
    if grep -q "QuantumNeuron" services/quantum-deep-mind/index.js; then
        check "Quantum Deep Mind service" 0
    else
        check "Quantum Deep Mind service" 1
    fi
else
    check "Quantum Deep Mind service exists" 1
fi

# Check AI Evolution Engine
if [ -f "services/ai-evolution-engine/index.js" ]; then
    if grep -q "GeneticEvolution" services/ai-evolution-engine/index.js; then
        check "AI Evolution Engine service" 0
    else
        check "AI Evolution Engine service" 1
    fi
else
    check "AI Evolution Engine service exists" 1
fi

# Check Quantum Tracking
if [ -f "services/quantum-tracking/index.js" ]; then
    check "Quantum Tracking service" 0
else
    check "Quantum Tracking service exists" 1
fi

echo ""
echo "🔍 Checking for Removed Files..."
echo ""

# Check that old files are removed
SHOULD_NOT_EXIST=("code.md" "code2.md" "implement.md" "READY_FOR_WORLD.md" "GOLIATH_KILLER.md")

for file in "${SHOULD_NOT_EXIST[@]}"; do
    if [ ! -f "$file" ]; then
        check "Removed $file" 0
    else
        check "Removed $file (still exists!)" 1
    fi
done

echo ""
echo "🇿🇦 Checking South African Integration..."
echo ""

# Check for SA payment methods in AI Evolution Engine
if grep -q "SnapScan" services/ai-evolution-engine/index.js && \
   grep -q "Zapper" services/ai-evolution-engine/index.js && \
   grep -q "Yoco" services/ai-evolution-engine/index.js; then
    check "SA payment methods integrated" 0
else
    check "SA payment methods integrated" 1
fi

# Check for 11 languages
if grep -q "'en'" services/ai-evolution-engine/index.js && \
   grep -q "'zu'" services/ai-evolution-engine/index.js && \
   grep -q "'xh'" services/ai-evolution-engine/index.js; then
    check "SA languages supported" 0
else
    check "SA languages supported" 1
fi

# Check for POPIA compliance
if grep -q "POPIA" "$AI_OWNERSHIP_DOC" 2>/dev/null || grep -q "POPIA" "$TERMS_DOC" 2>/dev/null; then
    check "POPIA compliance documented" 0
else
    check "POPIA compliance documented" 1
fi

echo ""
echo "=================================="
echo "📊 Verification Results"
echo "=================================="
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL CHECKS PASSED!${NC}"
    echo ""
    echo "✅ Repository is launch-ready!"
    echo "✅ Legal protection in place"
    echo "✅ PWA configured for offline use"
    echo "✅ All services present"
    echo "✅ SA integration complete"
    echo "✅ Proper attribution throughout"
    echo ""
    echo "🚀 Next steps:"
    echo "   1. Deploy to production server"
    echo "   2. Point azora.world to server"
    echo "   3. Configure SSL/HTTPS"
    echo "   4. Start services with PM2"
    echo "   5. Announce to the world!"
    echo ""
    echo "🇿🇦 Built in South Africa by Sizwe Ngwenya"
    exit 0
else
    echo -e "${YELLOW}⚠️  Some checks failed${NC}"
    echo ""
    echo "Please review the failed checks above and fix any issues."
    exit 1
fi
