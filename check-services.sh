#!/bin/bash
# ============================================================================
# Azora OS Service Health Check
# Verifies all services are running and responsive
# ============================================================================

echo "🔍 Checking Azora OS Service Health..."
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Service endpoints
declare -A SERVICES=(
    ["AI Orchestrator"]=":4001/health"
    ["Klipp Marketplace"]=":4002/health"
    ["Neural Context Engine"]=":4005/health"
    ["Retail Partner Integration"]=":4006/health"
    ["Cold Chain Quantum"]=":4007/health"
    ["Universal Safety"]=":4008/health"
    ["Autonomous Operations"]=":4009/health"
    ["Frontend Vite"]=":5173"
)

# Check each service
HEALTHY=0
UNHEALTHY=0

for service in "${!SERVICES[@]}"; do
    endpoint=${SERVICES[$service]}
    
    # Try to connect
    if curl -s -f "http://localhost$endpoint" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ $service${NC} - http://localhost$endpoint"
        ((HEALTHY++))
    else
        echo -e "${RED}❌ $service${NC} - http://localhost$endpoint (NOT RESPONDING)"
        ((UNHEALTHY++))
    fi
done

echo ""
echo "======================================"
echo -e "Summary: ${GREEN}${HEALTHY} healthy${NC} | ${RED}${UNHEALTHY} unhealthy${NC}"

# Check if .env has API keys configured
echo ""
echo "🔑 Checking API Key Configuration..."
echo "======================================"

if [ -f .env ]; then
    # Count empty API key lines
    EMPTY_KEYS=$(grep -E "^[A-Z_]*API_KEY=$|^[A-Z_]*SECRET=$|^[A-Z_]*TOKEN=$" .env | wc -l)
    TOTAL_KEYS=$(grep -E "^[A-Z_]*API_KEY=|^[A-Z_]*SECRET=|^[A-Z_]*TOKEN=" .env | wc -l)
    CONFIGURED_KEYS=$((TOTAL_KEYS - EMPTY_KEYS))
    
    echo -e "${YELLOW}⚠️  ${CONFIGURED_KEYS}/${TOTAL_KEYS} API keys configured${NC}"
    
    # Show which critical keys are missing
    echo ""
    echo "Critical API Keys Status:"
    
    check_key() {
        KEY=$1
        NAME=$2
        if grep -q "^${KEY}=.\+" .env 2>/dev/null; then
            echo -e "  ${GREEN}✅${NC} $NAME"
        else
            echo -e "  ${RED}❌${NC} $NAME - MISSING"
        fi
    }
    
    check_key "JWT_SECRET" "JWT Authentication"
    check_key "OPENAI_API_KEY" "OpenAI API"
    check_key "STRIPE_SECRET_KEY" "Stripe Payments"
    check_key "MONGO_URI" "MongoDB Database"
    check_key "AWS_ACCESS_KEY" "AWS Storage"
    check_key "GOOGLE_MAPS_API_KEY" "Google Maps"
    
else
    echo -e "${RED}❌ .env file not found!${NC}"
fi

echo ""
echo "======================================"

# Check running processes
echo ""
echo "🔄 Running Processes:"
echo "======================================"
ps aux | grep -E "node.*services|vite" | grep -v grep | awk '{print $11, $12, $13, $14, $15}' | head -10

echo ""
echo "======================================"
echo ""
echo "📚 Next Steps:"
echo "  1. Configure missing API keys in .env (see docs/reference/API_KEYS_REFERENCE.md)"
echo "  2. Open http://localhost:5173 to access Azora OS"
echo "  3. Run './check-services.sh' again to verify"
echo ""
echo "🚀 Ready to revolutionize logistics!"
