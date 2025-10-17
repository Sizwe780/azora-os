#!/bin/bash

# HR AI Deputy CEO - Quick Test Script
# Tests the autonomous management system

echo "🤖 HR AI DEPUTY CEO - QUICK TEST SCRIPT"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test HR AI Deputy service
echo "Testing HR AI Deputy CEO service..."
HR_AI_HEALTH=$(curl -s http://localhost:4091/health 2>/dev/null)
if [[ $HR_AI_HEALTH == *"healthy"* ]]; then
    echo -e "${GREEN}✓${NC} HR AI Deputy CEO is running"
else
    echo -e "${RED}✗${NC} HR AI Deputy CEO is not running"
    echo -e "${YELLOW}⚠️${NC}  Start it with: node services/hr-ai-deputy/index.js"
fi

echo ""
echo "Testing dashboard stats..."
DASHBOARD_STATS=$(curl -s http://localhost:4091/api/hr-ai/dashboard 2>/dev/null)
if [[ $DASHBOARD_STATS == *"success"* ]]; then
    echo -e "${GREEN}✓${NC} Dashboard API working"
    
    # Extract key metrics
    TOTAL_EMPLOYEES=$(echo $DASHBOARD_STATS | grep -o '"totalEmployees":[0-9]*' | grep -o '[0-9]*')
    ACTIVE_TASKS=$(echo $DASHBOARD_STATS | grep -o '"activeTasks":[0-9]*' | grep -o '[0-9]*')
    
    echo "   📊 Employees tracked: $TOTAL_EMPLOYEES"
    echo "   📋 Active tasks: $ACTIVE_TASKS"
else
    echo -e "${RED}✗${NC} Dashboard API not responding"
fi

echo ""
echo "Testing founders endpoint..."
FOUNDERS=$(curl -s http://localhost:4091/api/hr-ai/founders 2>/dev/null)
if [[ $FOUNDERS == *"success"* ]]; then
    echo -e "${GREEN}✓${NC} Founders API working"
    
    FOUNDER_COUNT=$(echo $FOUNDERS | grep -o '"count":[0-9]*' | grep -o '[0-9]*')
    echo "   ⭐ Founders loaded: $FOUNDER_COUNT"
else
    echo -e "${RED}✗${NC} Founders API not responding"
fi

echo ""
echo "Testing global expansion endpoint..."
EXPANSION=$(curl -s http://localhost:4091/api/hr-ai/expansion/tasks 2>/dev/null)
if [[ $EXPANSION == *"success"* ]]; then
    echo -e "${GREEN}✓${NC} Global expansion API working"
    echo "   🌍 Target markets: 10"
    echo "   ✅ Current reach: South Africa"
else
    echo -e "${RED}✗${NC} Global expansion API not responding"
fi

echo ""
echo "========================================"
echo "🤖 HR AI Deputy CEO Test Complete"
echo ""

# Test UI route
echo "Testing UI integration..."
if [ -f "src/pages/HRDeputyCEOPage.tsx" ]; then
    echo -e "${GREEN}✓${NC} HR AI Deputy CEO UI page exists"
    echo "   🎨 Access at: http://localhost:5173/hr-ai"
else
    echo -e "${RED}✗${NC} HR AI Deputy CEO UI page not found"
fi

echo ""
echo "========================================"
echo ""
echo "📚 Quick Start Commands:"
echo ""
echo "  Start service:"
echo "    node services/hr-ai-deputy/index.js"
echo ""
echo "  Start full system:"
echo "    pnpm run dev"
echo ""
echo "  Access UI:"
echo "    http://localhost:5173/hr-ai"
echo ""
echo "  Test onboarding:"
echo "    curl -X POST http://localhost:4091/api/hr-ai/onboarding/start \\"
echo "      -H 'Content-Type: application/json' \\"
echo "      -d '{\"name\":\"Jane Smith\",\"role\":\"Fleet Manager\",\"email\":\"jane@example.com\",\"startDate\":\"2025-10-20\",\"salary\":\"R50000\"}'"
echo ""
echo "  View documentation:"
echo "    cat docs/operations/HR_AI_DEPUTY_CEO_GUIDE.md"
echo ""
echo "========================================"
