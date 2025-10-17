#!/bin/bash

# 🚀 PRE-LAUNCH TEST SCRIPT
# This script verifies all UI components and backend services before 4PM launch

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  AZORA OS - PRE-LAUNCH UI INTEGRATION TEST                    ║"
echo "║  Target Launch Time: 4:00 PM, October 10, 2025               ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Documentation directories
DOCS_GUIDES_DIR="docs/guides"
DOCS_LAUNCH_DIR="docs/launch"
DOCS_OPERATIONS_DIR="docs/operations"

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to test service health
test_service() {
    local SERVICE_NAME=$1
    local PORT=$2
    
    echo -n "Testing $SERVICE_NAME (port $PORT)... "
    
    if curl -s -f "http://localhost:$PORT/health" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ OK${NC}"
        ((TESTS_PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAILED${NC}"
        ((TESTS_FAILED++))
        return 1
    fi
}

# Function to test UI route
test_ui_route() {
    local ROUTE_NAME=$1
    local ROUTE_PATH=$2
    
    echo -n "Testing UI route $ROUTE_NAME ($ROUTE_PATH)... "
    
    # In production, this would check if the route renders
    # For now, just verify the file exists
    if [ -f "src/pages/${ROUTE_NAME}.tsx" ]; then
        echo -e "${GREEN}✓ OK${NC}"
        ((TESTS_PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAILED${NC}"
        ((TESTS_FAILED++))
        return 1
    fi
}

echo "════════════════════════════════════════════════════════════════"
echo "PHASE 1: BACKEND SERVICES HEALTH CHECK"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Test original 16 services
test_service "AI Orchestrator" 4001
test_service "Klipp Service" 4002
test_service "Neural Context Engine" 4003
test_service "Retail Partner Integration" 4004
test_service "Cold Chain Quantum" 4005
test_service "Universal Safety" 4006
test_service "Autonomous Operations" 4007
test_service "Quantum Tracking" 4008
test_service "Quantum Deep Mind" 4009
test_service "AI Evolution Engine" 4010
test_service "Onboarding Service" 4011
test_service "Compliance Service" 4012
test_service "Maintenance Service" 4013
test_service "Driver Behavior Service" 4014
test_service "Analytics Service" 4015
test_service "Document Verification" 4085

# Test 6 new enterprise services
echo ""
echo "Testing NEW Enterprise Services..."
test_service "Admin Portal" 4085
test_service "Employee Onboarding" 4086
test_service "Document Vault" 4087
test_service "Traffic Routing" 4088
test_service "AI Trip Planning" 4089
test_service "Accessibility" 4090

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "PHASE 2: UI PAGES INTEGRATION CHECK"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Test existing pages
test_ui_route "SanctuaryPage" "/"
test_ui_route "DriverCommandCenter" "/driver"
test_ui_route "QuantumTracking" "/tracking"
test_ui_route "QuantumAI" "/ai"
test_ui_route "AIEvolution" "/evolution"

# Test new enterprise pages
echo ""
echo "Testing NEW Enterprise UI Pages..."
test_ui_route "AdminPortalPage" "/admin"
test_ui_route "EmployeeOnboardingPage" "/onboarding"
test_ui_route "DocumentVaultPage" "/documents"
test_ui_route "TrafficRoutingPage" "/traffic"
test_ui_route "AITripPlanningPage" "/trip-ai"
test_ui_route "AccessibilityPage" "/accessibility"

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "PHASE 3: DEPENDENCIES CHECK"
echo "════════════════════════════════════════════════════════════════"
echo ""

echo -n "Checking react-signature-canvas... "
if grep -q "react-signature-canvas" package.json; then
    echo -e "${GREEN}✓ Installed${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗ Missing${NC}"
    ((TESTS_FAILED++))
fi

echo -n "Checking react-hot-toast... "
if grep -q "react-hot-toast" package.json; then
    echo -e "${GREEN}✓ Installed${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗ Missing${NC}"
    ((TESTS_FAILED++))
fi

echo -n "Checking date-fns... "
if grep -q "date-fns" package.json; then
    echo -e "${GREEN}✓ Installed${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗ Missing${NC}"
    ((TESTS_FAILED++))
fi

echo -n "Checking framer-motion... "
if grep -q "framer-motion" package.json; then
    echo -e "${GREEN}✓ Installed${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗ Missing${NC}"
    ((TESTS_FAILED++))
fi

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "PHASE 4: CRITICAL FILES CHECK"
echo "════════════════════════════════════════════════════════════════"
echo ""

echo -n "Checking LICENSE (proprietary)... "
if grep -q "AZORA OS PROPRIETARY LICENSE" LICENSE; then
    echo -e "${GREEN}✓ Proprietary${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗ Still MIT${NC}"
    ((TESTS_FAILED++))
fi

echo -n "Checking ${DOCS_OPERATIONS_DIR}/FOUNDERS_GUIDE.md... "
if [ -f "${DOCS_OPERATIONS_DIR}/FOUNDERS_GUIDE.md" ]; then
    echo -e "${GREEN}✓ Exists${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗ Missing${NC}"
    ((TESTS_FAILED++))
fi

echo -n "Checking ${DOCS_OPERATIONS_DIR}/QUICK_REFERENCE.md... "
if [ -f "${DOCS_OPERATIONS_DIR}/QUICK_REFERENCE.md" ]; then
    echo -e "${GREEN}✓ Exists${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗ Missing${NC}"
    ((TESTS_FAILED++))
fi

echo -n "Checking ${DOCS_LAUNCH_DIR}/LAUNCH_CHECKLIST.md... "
if [ -f "${DOCS_LAUNCH_DIR}/LAUNCH_CHECKLIST.md" ]; then
    echo -e "${GREEN}✓ Exists${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗ Missing${NC}"
    ((TESTS_FAILED++))
fi

echo -n "Checking ${DOCS_GUIDES_DIR}/UI_INTEGRATION_GUIDE.md... "
if [ -f "${DOCS_GUIDES_DIR}/UI_INTEGRATION_GUIDE.md" ]; then
    echo -e "${GREEN}✓ Exists${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗ Missing${NC}"
    ((TESTS_FAILED++))
fi

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "TEST SUMMARY"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  ✓ ALL TESTS PASSED - READY FOR 4PM LAUNCH! 🚀                ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "Next steps:"
    echo "1. At 3:45 PM: Run 'pnpm run dev' to start all services"
    echo "2. At 3:50 PM: Run this script again to verify health checks"
    echo "3. At 3:55 PM: Open http://localhost:5173 and test each UI page"
    echo "4. At 4:00 PM: GO LIVE! 🎉"
    exit 0
else
    echo -e "${RED}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║  ✗ SOME TESTS FAILED - REVIEW BEFORE LAUNCH                   ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "Please fix the failed tests before launching."
    echo "Check the output above for specific failures."
    exit 1
fi
