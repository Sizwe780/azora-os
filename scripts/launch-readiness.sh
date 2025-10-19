#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 AZORA OS LAUNCH READINESS CHECK${NC}"
echo "======================================"

# Track compliance status
PASS_COUNT=0
TOTAL_CHECKS=0
CRITICAL_FAILURES=0

check_item() {
    TOTAL_CHECKS=$((TOTAL_CHECKS+1))
    if [ "$2" = true ]; then
        echo -e "${GREEN}✅ $1${NC}"
        PASS_COUNT=$((PASS_COUNT+1))
    else
        if [ "$3" = "critical" ]; then
            echo -e "${RED}❌ $1 [CRITICAL]${NC}"
            CRITICAL_FAILURES=$((CRITICAL_FAILURES+1))
        else
            echo -e "${YELLOW}⚠️ $1${NC}"
        fi
    fi
}

echo -e "\n${BLUE}1. File Structure Validation${NC}"
check_item "Azora Coin contract exists" "$(test -d azora-coin/contracts && echo true || echo false)" "critical"
check_item "UI Overhaul directory exists" "$(test -d 'UI Overhaul/src' && echo true || echo false)" "critical"
check_item "Services directory exists" "$(test -d services && echo true || echo false)" "critical"
check_item "Apps directory exists" "$(test -d apps && echo true || echo false)"

echo -e "\n${BLUE}2. Azora Coin Compliance${NC}"
if [ -f azora-coin/contracts/AzoraCoin.sol ]; then
    MAX_SUPPLY=$(grep -o "MAX_SUPPLY = [0-9]\+" azora-coin/contracts/AzoraCoin.sol | grep -o "[0-9]\+")
    check_item "Azora Coin has 1 million supply limit" "$(test "$MAX_SUPPLY" = "1000000" && echo true || echo false)" "critical"
    
    # Check multi-sig implementation
    HAS_MULTISIG=$(grep -q "requiredApprovals\|multiSig\|approvals" azora-coin/contracts/AzoraCoin.sol && echo true || echo false)
    check_item "Multi-signature governance implemented" "$HAS_MULTISIG" "critical"
else
    check_item "Azora Coin contract properly implemented" "false" "critical"
fi

echo -e "\n${BLUE}3. Service Integration${NC}"
# Check key services
for SERVICE in "compliance-service" "azora-coin-integration"; do
    check_item "$SERVICE implementation exists" "$(test -d services/$SERVICE && echo true || echo false)" "critical"
    if [ -d "services/$SERVICE" ]; then
        # Check for mock implementation warnings
        MOCK_COUNT=$(grep -r "TODO\|MOCK\|FAKE\|DUMMY" --include="*.js" services/$SERVICE | wc -l)
        if [ "$MOCK_COUNT" -gt 0 ]; then
            check_item "$SERVICE has no mock implementations" "false"
            echo -e "   Found ${MOCK_COUNT} potential mock implementations"
        else
            check_item "$SERVICE has no mock implementations" "true"
        fi
    fi
done

echo -e "\n${BLUE}4. Docker Configuration${NC}"
check_item "docker-compose.yml exists" "$(test -f docker-compose.yml && echo true || echo false)" "critical"
if [ -f docker-compose.yml ]; then
    # Check for duplicate service entries
    DUPLICATE_SERVICE=$(sort < docker-compose.yml | uniq -d | grep -c "service:")
    check_item "No duplicate service entries in docker-compose.yml" "$(test $DUPLICATE_SERVICE -eq 0 && echo true || echo false)" "critical"
    
    # Check if key services are defined in docker-compose
    for SERVICE in "compliance-service" "azora-coin-integration"; do
        SERVICE_DEFINED=$(grep -q "$SERVICE:" docker-compose.yml && echo true || echo false)
        check_item "$SERVICE defined in docker-compose.yml" "$SERVICE_DEFINED" "critical"
    done
fi

echo -e "\n${BLUE}5. UI Consistency${NC}"
# Check if UI components are consistent between UI Overhaul and main-app
if [ -d "UI Overhaul/src/components" ] && [ -d "apps/main-app/src/components" ]; then
    # Count components in each directory
    UI_OVERHAUL_COUNT=$(find "UI Overhaul/src/components" -name "*.jsx" | wc -l)
    MAIN_APP_COUNT=$(find "apps/main-app/src/components" -name "*.jsx" | wc -l)
    
    # Check if there's a reasonable match (at least 70%)
    CONSISTENCY_THRESHOLD=0.7
    if [ $UI_OVERHAUL_COUNT -gt 0 ] && [ $MAIN_APP_COUNT -gt 0 ]; then
        RATIO=$(echo "scale=2; $MAIN_APP_COUNT / $UI_OVERHAUL_COUNT" | bc)
        IS_CONSISTENT=$(echo "$RATIO >= $CONSISTENCY_THRESHOLD" | bc)
        check_item "UI components are consistent across applications ($MAIN_APP_COUNT vs $UI_OVERHAUL_COUNT)" "$(test $IS_CONSISTENT -eq 1 && echo true || echo false)"
    else
        check_item "UI components found in both directories" "false"
    fi
else
    check_item "UI components directories exist in both UI Overhaul and main-app" "false"
fi

echo -e "\n${BLUE}6. Nudge Law Compliance${NC}"
# Check for nudge implementation examples
NUDGE_IMPLEMENTATIONS=$(find . -type f -name "*.jsx" -o -name "*.js" | grep -v "node_modules" | xargs grep -l "nudge\|optOut\|userPreference\|transparency" | wc -l)
check_item "Nudge law implementation examples found ($NUDGE_IMPLEMENTATIONS)" "$(test $NUDGE_IMPLEMENTATIONS -gt 0 && echo true || echo false)"

echo -e "\n${BLUE}7. Environment Configuration${NC}"
check_item ".env file exists" "$(test -f .env && echo true || echo false)"
check_item "azora-coin/.env file exists" "$(test -f azora-coin/.env && echo true || echo false)"

echo -e "\n${BLUE}8. Security Checks${NC}"
# Check for exposed secrets
EXPOSED_SECRETS=$(grep -r "key\|password\|secret\|token" --include="*.js" --include="*.jsx" --include="*.sol" --exclude-dir="node_modules" . | grep -v "process.env" | wc -l)
check_item "No exposed secrets in code" "$(test $EXPOSED_SECRETS -eq 0 && echo true || echo false)" "critical"

# Calculate overall compliance score
COMPLIANCE_SCORE=$((PASS_COUNT * 100 / TOTAL_CHECKS))

echo "======================================"
echo -e "${BLUE}COMPLIANCE SUMMARY:${NC}"
echo "Total checks: $TOTAL_CHECKS"
echo "Passed checks: $PASS_COUNT"
echo -e "Overall compliance score: ${BLUE}$COMPLIANCE_SCORE%${NC}"

if [ $CRITICAL_FAILURES -gt 0 ]; then
    echo -e "\n${RED}❌ LAUNCH BLOCKED: $CRITICAL_FAILURES critical compliance issues found${NC}"
    echo "Please address all critical issues before proceeding with the launch."
    exit 1
elif [ $COMPLIANCE_SCORE -ge 90 ]; then
    echo -e "\n${GREEN}✅ LAUNCH READY: Azora OS is compliant and ready for launch!${NC}"
    exit 0
else
    echo -e "\n${YELLOW}⚠️ LAUNCH CAUTION: Non-critical issues found${NC}"
    echo "Azora OS can be launched, but consider addressing the warnings for optimal performance."
    exit 0
fi
