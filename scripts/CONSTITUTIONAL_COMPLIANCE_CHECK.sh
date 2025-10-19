#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}"
cat << 'BANNER'
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   AZORA OS - CONSTITUTIONAL COMPLIANCE VALIDATOR           ║
║                                                            ║
║   Validates 100% compliance with Constitution Articles    ║
║   VI (Technical Infrastructure) and IX (No Mock Protocol) ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
BANNER
echo -e "${NC}\n"

# Initialize counters
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0
VIOLATIONS=()

# Article VI, Section 1: Check for prohibited dependencies
echo -e "${YELLOW}📜 Article VI, Section 1: Self-Sufficiency Check${NC}"
echo "Scanning for prohibited external dependencies..."
echo ""

check_dependency() {
  TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
  local name=$1
  local pattern=$2
  
  if grep -r "$pattern" --include="*.{js,ts,json}" --exclude-dir={node_modules,dist,build} . > /dev/null 2>&1; then
    echo -e "${RED}❌ VIOLATION: $name detected${NC}"
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
    VIOLATIONS+=("Article VI.1: $name dependency found")
    grep -r "$pattern" --include="*.{js,ts,json}" --exclude-dir={node_modules,dist,build} . | head -n 3
    echo ""
  else
    echo -e "${GREEN}✅ PASS: No $name dependencies${NC}"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
  fi
}

# Check prohibited services
check_dependency "AWS" "aws-sdk\|amazonaws\.com\|\.aws\/"
check_dependency "Google Cloud" "google-cloud\|googleapis\.com\|@google-cloud"
check_dependency "Azure" "azure\|microsoft\.azure"
check_dependency "OpenAI" "openai\|api\.openai\.com"
check_dependency "Anthropic/Claude" "anthropic\|claude\|api\.anthropic\.com"
check_dependency "Stripe" "stripe\|api\.stripe\.com"
check_dependency "PayPal" "paypal\|api\.paypal\.com"
check_dependency "Square" "square\|squareup\.com"

echo ""
echo -e "${YELLOW}📜 Article VI, Section 2: Own Infrastructure Check${NC}"
echo "Verifying self-owned infrastructure..."
echo ""

check_infrastructure() {
  TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
  local name=$1
  local path=$2
  
  if [ -d "$path" ] || [ -f "$path" ]; then
    echo -e "${GREEN}✅ PASS: $name infrastructure exists${NC}"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
  else
    echo -e "${RED}❌ VIOLATION: $name infrastructure missing${NC}"
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
    VIOLATIONS+=("Article VI.2: $name infrastructure not found at $path")
  fi
}

# Check required infrastructure
check_infrastructure "Azora AI Models" "infrastructure/azora-ai-models"
check_infrastructure "Azora Pay" "infrastructure/azora-pay"
check_infrastructure "Blockchain" "azora-coin"
check_infrastructure "Database Schema" "infrastructure/database-schema.sql"
check_infrastructure "Email System" "services/email-domain-service"

echo ""
echo -e "${YELLOW}📜 Article IX: No Mock Protocol Check${NC}"
echo "Scanning for mock/placeholder code..."
echo ""

check_no_mock() {
  TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
  local name=$1
  local pattern=$2
  
  local count=$(grep -r "$pattern" --include="*.{js,ts,jsx,tsx}" --exclude-dir={node_modules,dist,build,test,__tests__} . 2>/dev/null | wc -l)
  
  if [ "$count" -gt 0 ]; then
    echo -e "${RED}❌ VIOLATION: $name found ($count occurrences)${NC}"
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
    VIOLATIONS+=("Article IX: $name - $count occurrences")
    grep -r "$pattern" --include="*.{js,ts,jsx,tsx}" --exclude-dir={node_modules,dist,build,test,__tests__} . 2>/dev/null | head -n 5
    echo ""
  else
    echo -e "${GREEN}✅ PASS: No $name${NC}"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
  fi
}

# Check for mock patterns
check_no_mock "Mock implementations" "\.mock\(|jest\.mock|sinon\.stub"
check_no_mock "TODO implementations" "TODO:.*implementation|FIXME:.*implement"
check_no_mock "Placeholder data" "PLACEHOLDER|STUB|FAKE_DATA"
check_no_mock "Dummy functions" "function dummy|const dummy"

echo ""
echo -e "${YELLOW}📊 Service Implementation Check${NC}"
echo "Verifying services have real implementations..."
echo ""

# Check services directory
if [ -d "services" ]; then
  for service in services/*/; do
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    service_name=$(basename "$service")
    
    # Check if service has index.js or real implementation
    if [ -f "${service}index.js" ] || [ -f "${service}index.ts" ] || [ -f "${service}server.js" ]; then
      # Check if file has more than 50 lines (not just stub)
      lines=$(cat ${service}index.{js,ts} ${service}server.js 2>/dev/null | wc -l)
      
      if [ "$lines" -gt 50 ]; then
        echo -e "${GREEN}✅ $service_name: Real implementation ($lines lines)${NC}"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
      else
        echo -e "${YELLOW}⚠️  $service_name: Stub/minimal implementation ($lines lines)${NC}"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
        VIOLATIONS+=("Service $service_name is a stub (<50 lines)")
      fi
    else
      echo -e "${RED}❌ $service_name: No implementation file${NC}"
      FAILED_CHECKS=$((FAILED_CHECKS + 1))
      VIOLATIONS+=("Service $service_name has no implementation")
    fi
  done
fi

echo ""
echo -e "${YELLOW}🔒 Security Requirements Check${NC}"
echo "Verifying constitutional security standards..."
echo ""

TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
if grep -r "AES-256\|aes256\|crypto\.createCipher" --include="*.{js,ts}" . > /dev/null 2>&1; then
  echo -e "${GREEN}✅ AES-256 encryption implemented${NC}"
  PASSED_CHECKS=$((PASSED_CHECKS + 1))
else
  echo -e "${RED}❌ AES-256 encryption not found${NC}"
  FAILED_CHECKS=$((FAILED_CHECKS + 1))
  VIOLATIONS+=("Article VI.4: AES-256 encryption required")
fi

TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
if grep -r "2fa\|mfa\|multi.*factor" --include="*.{js,ts}" . > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Multi-factor authentication implemented${NC}"
  PASSED_CHECKS=$((PASSED_CHECKS + 1))
else
  echo -e "${RED}❌ Multi-factor authentication not found${NC}"
  FAILED_CHECKS=$((FAILED_CHECKS + 1))
  VIOLATIONS+=("Article VI.4: MFA required")
fi

# Final Report
echo ""
echo "════════════════════════════════════════════════════════"
echo -e "${BLUE}📋 CONSTITUTIONAL COMPLIANCE REPORT${NC}"
echo "════════════════════════════════════════════════════════"
echo ""
echo "Total Checks:  $TOTAL_CHECKS"
echo -e "${GREEN}Passed:        $PASSED_CHECKS${NC}"
echo -e "${RED}Failed:        $FAILED_CHECKS${NC}"
echo ""

compliance_percent=$(awk "BEGIN {printf \"%.1f\", ($PASSED_CHECKS/$TOTAL_CHECKS)*100}")
echo "Compliance Rate: $compliance_percent%"
echo ""

if [ "$FAILED_CHECKS" -gt 0 ]; then
  echo -e "${RED}╔════════════════════════════════════════════╗${NC}"
  echo -e "${RED}║  ⚠️  CONSTITUTIONAL VIOLATIONS DETECTED   ║${NC}"
  echo -e "${RED}╚════════════════════════════════════════════╝${NC}"
  echo ""
  echo "Violations:"
  printf '%s\n' "${VIOLATIONS[@]}" | nl
  echo ""
  echo "⚖️  Action Required: Fix violations to achieve compliance"
  echo ""
  exit 1
else
  echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
  echo -e "${GREEN}║  ✅ FULLY CONSTITUTIONALLY COMPLIANT      ║${NC}"
  echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"
  echo ""
  echo "🎉 Azora OS meets all constitutional requirements!"
  echo ""
  exit 0
fi
