#!/bin/bash

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║  🚀 STARTING AZORA OS - LAUNCH READY! 🚀                  ║"
echo "║                                                            ║"
echo "║  🎉 LAUNCH SPECIAL: 1 Month FREE + 50% OFF Next 2!        ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Start promotional service first
echo "Starting Promotional Service..."
cd services/promotions && node index.js > /tmp/promotions.log 2>&1 &
echo "✅ Promotions running (port 4095)"
cd ../..
sleep 2

# Start Azora Pay
if [ -f "infrastructure/azora-pay/index.js" ]; then
  cd infrastructure/azora-pay && node index.js > /tmp/azora-pay.log 2>&1 &
  echo "✅ Azora Pay started (port 5000)"
  cd ../..
fi

# Start Onboarding
if [ -f "services/onboarding/index.js" ]; then
  cd services/onboarding && node index.js > /tmp/onboarding.log 2>&1 &
  echo "✅ Onboarding Service started (port 4070)"
  cd ../..
fi

# Start HR AI Deputy
if [ -f "services/hr-ai-deputy/index.js" ]; then
  cd services/hr-ai-deputy && node index.js > /tmp/hr-ai.log 2>&1 &
  echo "✅ HR AI Deputy started (port 4091)"
  cd ../..
fi

# Start Auth Service
if [ -f "services/auth/index.js" ]; then
  cd services/auth && node index.js > /tmp/auth.log 2>&1 &
  echo "✅ Auth Service started (port 4004)"
  cd ../..
fi

# Open launch page in browser
if [ -f "apps/launch-page/index.html" ]; then
  echo ""
  echo "Opening launch page..."
  sleep 2
  "$BROWSER" "file://$(pwd)/apps/launch-page/index.html" 2>/dev/null || \
    echo "Launch page available at: file://$(pwd)/apps/launch-page/index.html"
fi

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  ✅ AZORA OS IS NOW LIVE! ✅                              ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "🎉 LAUNCH SPECIAL:"
echo "  • 1 Month FREE Trial"
echo "  • 50% OFF Next 2 Months"
echo "  • All Premium Features"
echo "  • 100 AZR Coin Bonus"
echo ""
echo "Access Points:"
echo "  • Launch Page: file://$(pwd)/apps/launch-page/index.html"
echo "  • Promotions API: http://localhost:4095/launch-offer"
echo "  • Azora Pay: http://localhost:5000"
echo "  • Onboarding: http://localhost:4070/pricing"
echo ""
echo "Special Promo Codes:"
echo "  • SIZWE2025 - Founder 1 Year FREE (sizwe.ngwenya@azora.world)"
echo "  • LAUNCH50 - 50% off 3 months"
echo "  • EARLYBIRD - 75% off first month"
echo "  • AFRICA25 - 25% off 6 months (Africa)"
echo ""
echo "Contact: sizwe.ngwenya@azora.world | +27 73 234 7232"
echo ""
echo "Logs:"
echo "  • Promotions: /tmp/promotions.log"
echo "  • Azora Pay: /tmp/azora-pay.log"
echo "  • Onboarding: /tmp/onboarding.log"
echo ""
