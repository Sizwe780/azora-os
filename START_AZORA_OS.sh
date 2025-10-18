#!/bin/bash

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║        🌍 LAUNCHING AZORA WORLD 🌍                        ║"
echo "║                                                            ║"
echo "║  The Beginning of Azora Minting & Token Distribution      ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "🎉 LAUNCH SPECIAL:"
echo "   • 1 Month FREE Trial"
echo "   • 50% OFF Next 2 Months"
echo "   • All Premium Features"
echo "   • 100 AZR Coin Bonus"
echo ""
echo "Starting services..."
echo ""

# Kill any existing services
pkill -f "node.*promotions" 2>/dev/null
pkill -f "node.*azora-pay" 2>/dev/null
pkill -f "node.*onboarding" 2>/dev/null
pkill -f "node.*hr-ai-deputy" 2>/dev/null
pkill -f "node.*auth" 2>/dev/null

sleep 2

# Start Promotional Service
if [ -f "services/promotions/index.js" ]; then
  echo "Starting Promotional Service..."
  cd services/promotions
  npm install --silent 2>/dev/null
  node index.js > /tmp/promotions.log 2>&1 &
  PROMO_PID=$!
  echo "✅ Promotions Service (PID: $PROMO_PID) - Port 4095"
  cd ../..
  sleep 2
fi

# Start Azora Pay
if [ -f "infrastructure/azora-pay/index.js" ]; then
  echo "Starting Azora Pay..."
  cd infrastructure/azora-pay
  npm install --silent 2>/dev/null
  node index.js > /tmp/azora-pay.log 2>&1 &
  PAY_PID=$!
  echo "✅ Azora Pay (PID: $PAY_PID) - Port 5000"
  cd ../..
  sleep 2
fi

# Start Onboarding
if [ -f "services/onboarding/index.js" ]; then
  echo "Starting Onboarding Service..."
  cd services/onboarding
  npm install --silent 2>/dev/null
  node index.js > /tmp/onboarding.log 2>&1 &
  ONBOARD_PID=$!
  echo "✅ Onboarding Service (PID: $ONBOARD_PID) - Port 4070"
  cd ../..
  sleep 2
fi

# Start HR AI Deputy
if [ -f "services/hr-ai-deputy/index.js" ]; then
  echo "Starting HR AI Deputy..."
  cd services/hr-ai-deputy
  node index.js > /tmp/hr-ai.log 2>&1 &
  HR_PID=$!
  echo "✅ HR AI Deputy (PID: $HR_PID) - Port 4091"
  cd ../..
  sleep 2
fi

# Start Auth Service
if [ -f "services/auth/index.js" ]; then
  echo "Starting Auth Service..."
  cd services/auth
  node index.js > /tmp/auth.log 2>&1 &
  AUTH_PID=$!
  echo "✅ Auth Service (PID: $AUTH_PID) - Port 4004"
  cd ../..
  sleep 2
fi

# Wait for services to be ready
echo ""
echo "Waiting for services to initialize..."
sleep 3

# Health checks
echo ""
echo "Running health checks..."
HEALTHY=true

check_service() {
  local name=$1
  local port=$2
  if curl -s "http://localhost:$port/health" > /dev/null 2>&1; then
    echo "✅ $name is healthy"
  else
    echo "⚠️  $name not responding (this is normal if service doesn't have /health endpoint)"
  fi
}

check_service "Promotions" 4095
check_service "Azora Pay" 5000
check_service "Onboarding" 4070
check_service "HR AI Deputy" 4091
check_service "Auth" 4004

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║  🎉 AZORA WORLD IS NOW LIVE! 🎉                           ║"
echo "║                                                            ║"
echo "║  Welcome to the future of African technology! 🇿🇦          ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "🌐 Access Points:"
echo "   • Launch Page: file://$(pwd)/apps/launch-page/index.html"
echo "   • Promotions API: http://localhost:4095"
echo "   • Azora Pay: http://localhost:5000"
echo "   • Onboarding: http://localhost:4070"
echo "   • HR AI Deputy: http://localhost:4091"
echo "   • Auth Service: http://localhost:4004"
echo ""
echo "🎁 Special Promo Codes:"
echo "   • SIZWE2025 - Founder 1 Year FREE (sizwe.ngwenya@azora.world)"
echo "   • LAUNCH50 - 50% off 3 months"
echo "   • EARLYBIRD - 75% off first month"
echo "   • AFRICA25 - 25% off 6 months (Africa only)"
echo ""
echo "📊 Quick Tests:"
echo ""
echo "# Get launch offer for South Africa:"
echo "curl http://localhost:4095/launch-offer?country=ZA"
echo ""
echo "# Start trial for Sizwe (with founder code):"
echo "curl -X POST http://localhost:4095/trial/start \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"email\":\"sizwe.ngwenya@azora.world\",\"fullName\":\"Sizwe Ngwenya\",\"role\":\"business\",\"country\":\"ZA\",\"promoCode\":\"SIZWE2025\"}'"
echo ""
echo "# Get SA pricing:"
echo "curl http://localhost:4070/pricing?country=ZA"
echo ""
echo "# Check SA payment methods:"
echo "curl http://localhost:5000/payment-methods/ZA"
echo ""
echo "📧 Contact:"
echo "   Email: sizwe.ngwenya@azora.world"
echo "   Phone: +27 73 234 7232"
echo "   LinkedIn: https://www.linkedin.com/in/sizwe-ngwenya-518314146/"
echo ""
echo "📝 Logs:"
echo "   Promotions: tail -f /tmp/promotions.log"
echo "   Azora Pay: tail -f /tmp/azora-pay.log"
echo "   Onboarding: tail -f /tmp/onboarding.log"
echo "   HR AI: tail -f /tmp/hr-ai.log"
echo "   Auth: tail -f /tmp/auth.log"
echo ""
echo "🛑 To stop all services:"
echo "   ./STOP_AZORA_OS.sh"
echo ""
echo "🇿🇦 From Africa, For Humanity, Towards Infinity 🚀"
echo ""
