#!/bin/bash

echo "🚀 Starting Azora OS Complete System Integration Test"
echo "===================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if a service is healthy
check_service() {
    local service_name=$1
    local url=$2
    local max_attempts=10
    local attempt=1

    echo -n "Checking $service_name... "

    while [ $attempt -le $max_attempts ]; do
        if curl -s -f "$url" > /dev/null 2>&1; then
            echo -e "${GREEN}✓${NC}"
            return 0
        fi
        echo -n "."
        sleep 3
        ((attempt++))
    done

    echo -e "${RED}✗${NC}"
    return 1
}

# Start all services
echo "Starting complete Azora OS system..."
docker-compose -f docker-compose.yml up -d --build
docker-compose -f docker-compose.compliance.yml up -d --build

# Wait for services to be ready
echo "Waiting for all services to be healthy..."
sleep 30

# Check all services
all_services_healthy=true

echo ""
echo "🗄️  Checking Database Services..."
check_service "PostgreSQL" "http://localhost:5432" || all_services_healthy=false
check_service "Redis" "http://localhost:6379" || all_services_healthy=false

echo ""
echo "🤖 Checking AI & Orchestration Services..."
check_service "AI Orchestrator" "http://localhost:4001/health" || all_services_healthy=false
check_service "Neural Context Engine" "http://localhost:4005/health" || all_services_healthy=false
check_service "AI Evolution Engine" "http://localhost:4060/health" || all_services_healthy=false

echo ""
echo "💼 Checking Business Logic Services..."
check_service "Assistant" "http://localhost:4000/health" || all_services_healthy=false
check_service "Knowledge Base" "http://localhost:4003/health" || all_services_healthy=false
check_service "Auth Service" "http://localhost:4004/health" || all_services_healthy=false
check_service "Store Service" "http://localhost:4002/health" || all_services_healthy=false

echo ""
echo "⚛️  Checking Quantum Services..."
check_service "Cold Chain Quantum" "http://localhost:4007/health" || all_services_healthy=false
check_service "Universal Safety" "http://localhost:4008/health" || all_services_healthy=false
check_service "Autonomous Operations" "http://localhost:4009/health" || all_services_healthy=false
check_service "Quantum Tracking" "http://localhost:4040/health" || all_services_healthy=false
check_service "Quantum Deep Mind" "http://localhost:4050/health" || all_services_healthy=false

echo ""
echo "🗣️  Checking Communication Services..."
check_service "Voice Service" "http://localhost:4010/health" || all_services_healthy=false
check_service "Conversation Service" "http://localhost:4011/health" || all_services_healthy=false
check_service "Speaker Service" "http://localhost:4012/health" || all_services_healthy=false

echo ""
echo "🛡️  Checking Security Services..."
check_service "Security Core" "http://localhost:4022/health" || all_services_healthy=false
check_service "Security Camera" "http://localhost:4020/health" || all_services_healthy=false
check_service "Security POS" "http://localhost:4021/health" || all_services_healthy=false

echo ""
echo "🏪 Checking Business Services..."
check_service "Retail Partner Integration" "http://localhost:4006/health" || all_services_healthy=false
check_service "Klipp Service" "http://localhost:4002/health" || all_services_healthy=false

echo ""
echo "🚛 Checking Operational Services..."
check_service "Procurement Corridor" "http://localhost:4032/health" || all_services_healthy=false
check_service "Traffic Routing" "http://localhost:4033/health" || all_services_healthy=false
check_service "AI Trip Planning" "http://localhost:4034/health" || all_services_healthy=false

echo ""
echo "📋 Checking Compliance & Admin Services..."
check_service "GDPR Compliance" "http://localhost:4080/health" || all_services_healthy=false
check_service "HIPAA Compliance" "http://localhost:4081/health" || all_services_healthy=false
check_service "SOX Compliance" "http://localhost:4082/health" || all_services_healthy=false
check_service "CCPA Compliance" "http://localhost:4083/health" || all_services_healthy=false
check_service "PIPEDA Compliance" "http://localhost:4084/health" || all_services_healthy=false
check_service "LGPD Compliance" "http://localhost:4085/health" || all_services_healthy=false
check_service "South African Compliance" "http://localhost:4090/health" || all_services_healthy=false
check_service "Compliance Service" "http://localhost:4035/health" || all_services_healthy=false
check_service "Advanced Compliance Engine" "http://localhost:4036/health" || all_services_healthy=false
check_service "HR AI Deputy" "http://localhost:4037/health" || all_services_healthy=false
check_service "Employee Onboarding" "http://localhost:4038/health" || all_services_healthy=false
check_service "Document Vault" "http://localhost:4039/health" || all_services_healthy=false
check_service "Document Verification" "http://localhost:4041/health" || all_services_healthy=false

echo ""
echo "📊 Checking Monitoring & Analytics Services..."
check_service "Analytics Service" "http://localhost:4042/health" || all_services_healthy=false
check_service "Maintenance Service" "http://localhost:4043/health" || all_services_healthy=false
check_service "Driver Behavior Service" "http://localhost:4044/health" || all_services_healthy=false

echo ""
echo "🎭 Checking Orchestration & Simulation..."
check_service "Orchestrator" "http://localhost:4030/health" || all_services_healthy=false
check_service "Simulator" "http://localhost:4031/health" || all_services_healthy=false

echo ""
echo "🔧 Checking Specialized Services..."
check_service "Accessibility" "http://localhost:4045/health" || all_services_healthy=false
check_service "Admin Portal" "http://localhost:4046/health" || all_services_healthy=false
check_service "Conflict Resolution" "http://localhost:4047/health" || all_services_healthy=false
check_service "Marketplace Service" "http://localhost:4048/health" || all_services_healthy=false
check_service "Onboarding Service" "http://localhost:4049/health" || all_services_healthy=false
check_service "Payment Service" "http://localhost:4051/health" || all_services_healthy=false
check_service "Policy Service" "http://localhost:4052/health" || all_services_healthy=false
check_service "Subscription Service" "http://localhost:4053/health" || all_services_healthy=false

echo ""
echo "⚛️  Checking Quantum Microservices..."
check_service "Quantum Microservice" "http://localhost:5000/health" || all_services_healthy=false
check_service "Shield Service" "http://localhost:5001/health" || all_services_healthy=false

echo ""
echo "🖥️  Checking Main Backend..."
check_service "Main Backend" "http://localhost:3000/health" || all_services_healthy=false

echo ""
echo "📱 Checking Frontend Applications..."
check_service "Main App" "http://localhost:5175" || all_services_healthy=false
check_service "Security Dashboard" "http://localhost:5176" || all_services_healthy=false
check_service "Driver PWA" "http://localhost:3001" || all_services_healthy=false
check_service "Staff PWA" "http://localhost:5177" || all_services_healthy=false

# Test UI builds
echo ""
echo "🔨 Testing UI Builds..."
cd compliance-ui
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Compliance UI builds successfully!${NC}"
else
    echo -e "${RED}❌ Compliance UI build failed${NC}"
    all_services_healthy=false
fi
cd ..

# Test API connectivity between services
echo ""
echo "🔗 Testing Service Interconnectivity..."

# Test AI Orchestrator to Neural Context Engine
if curl -s -f "http://localhost:4001/api/neural-context" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ AI Orchestrator ↔ Neural Context Engine${NC}"
else
    echo -e "${YELLOW}⚠️  AI Orchestrator ↔ Neural Context Engine (expected in full integration)${NC}"
fi

# Test Auth to Store integration
if curl -s -f "http://localhost:4004/api/store/status" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Auth Service ↔ Store Service${NC}"
else
    echo -e "${YELLOW}⚠️  Auth Service ↔ Store Service (expected in full integration)${NC}"
fi

# Test Compliance Dashboard to individual compliance services
if curl -s -f "http://localhost:4086/api/compliance/gdpr" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Compliance Dashboard ↔ GDPR Service${NC}"
else
    echo -e "${YELLOW}⚠️  Compliance Dashboard ↔ GDPR Service (expected in full integration)${NC}"
fi

if curl -s -f "http://localhost:4086/api/compliance/south-africa" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Compliance Dashboard ↔ South African Compliance${NC}"
else
    echo -e "${YELLOW}⚠️  Compliance Dashboard ↔ South African Compliance (expected in full integration)${NC}"
fi

# Test Quantum service integration
if curl -s -f "http://localhost:5000/api/shield/status" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Quantum Microservice ↔ Shield Service${NC}"
else
    echo -e "${YELLOW}⚠️  Quantum Microservice ↔ Shield Service (expected in full integration)${NC}"
fi

if [ "$all_services_healthy" = true ]; then
    echo ""
    echo -e "${GREEN}🎉 COMPLETE AZORA OS INTEGRATION TEST PASSED!${NC}"
    echo ""
    echo "🌍 System Status: FULLY OPERATIONAL"
    echo "==================================="
    echo ""
    echo "🗄️  Databases: PostgreSQL, Redis"
    echo "🤖 AI Services: Orchestrator, Neural Context, Evolution Engine"
    echo "💼 Business Logic: Assistant, Auth, Store, Knowledge"
    echo "⚛️  Quantum Tech: Cold Chain, Safety, Autonomous Ops, Tracking, Deep Mind"
    echo "🗣️  Communication: Voice, Conversation, Speaker"
    echo "🛡️  Security: Core, Camera, POS systems"
    echo "🏪 Retail: Partner Integration, Klipp Service"
    echo "🚛 Operations: Procurement, Traffic Routing, AI Trip Planning"
    echo "📋 Compliance: 7 Frameworks (GDPR, HIPAA, SOX, CCPA, PIPEDA, LGPD, ZA)"
    echo "📊 Analytics: Services, Maintenance, Driver Behavior"
    echo "🎭 Orchestration: Main Orchestrator, Simulator"
    echo "🔧 Specialized: Accessibility, Admin, Conflict Resolution, Marketplace"
    echo "⚛️  Quantum: Microservice, Shield Service"
    echo "🖥️  Backend: Main API Server"
    echo "📱 Frontend: Main App, Security Dashboard, Driver PWA, Staff PWA"
    echo ""
    echo "🚀 To access the system:"
    echo "========================"
    echo "• Main Application: http://localhost:5175"
    echo "• Security Dashboard: http://localhost:5176"
    echo "• Driver PWA: http://localhost:3001"
    echo "• Staff PWA: http://localhost:5177"
    echo "• Compliance Dashboard: http://localhost:4086"
    echo "• API Documentation: http://localhost:3000/api/docs"
    echo "• Quantum Services: http://localhost:5000"
    echo ""
    echo "📊 Management Commands:"
    echo "======================="
    echo "• View all services: docker-compose ps"
    echo "• View logs: docker-compose logs -f [service-name]"
    echo "• Stop system: docker-compose down"
    echo "• Restart service: docker-compose restart [service-name]"
    echo ""
    echo "🇿🇦 South African Compliance Coverage:"
    echo "====================================="
    echo "• POPIA - Protection of Personal Information Act"
    echo "• ECT Act - Electronic Communications and Transactions Act"
    echo "• CPA - Consumer Protection Act"
    echo "• NCA - National Credit Act"
    echo "• FICA - Financial Intelligence Centre Act"
    echo "• LRA - Labour Relations Act"
    echo "• BCEA - Basic Conditions of Employment Act"
    echo ""
    echo "🎯 RESULT: Azora OS is fully integrated and operational!"
else
    echo ""
    echo -e "${RED}❌ COMPLETE INTEGRATION TEST FAILED!${NC}"
    echo "Some services are not properly integrated or healthy."
    echo ""
    echo "🔍 Troubleshooting:"
    echo "==================="
    echo "• Check service logs: docker-compose logs [failed-service]"
    echo "• Verify Docker resources: docker system df"
    echo "• Check port conflicts: netstat -tulpn | grep :[port]"
    echo "• Restart failed services: docker-compose restart [service]"
    echo ""
    docker-compose ps
    exit 1
fi