#!/bin/bash

echo "🌍 LAUNCHING AZORA.WORLD"
echo "═══════════════════════════════════════"
echo ""

# Verify domain is configured
echo "Checking domain configuration..."
if ping -c 1 azora.world > /dev/null 2>&1; then
    echo "✅ Domain azora.world is reachable"
else
    echo "❌ Domain azora.world not configured"
    echo "Please configure DNS records first:"
    echo "  A record: azora.world → [Your Production IP]"
    exit 1
fi

# Check SSL
echo "Checking SSL certificates..."
if curl -I https://azora.world 2>/dev/null | grep -q "200 OK"; then
    echo "✅ SSL configured correctly"
else
    echo "⚠️  SSL not yet configured"
    echo "Run: sudo certbot --nginx -d azora.world -d www.azora.world"
fi

# Start all services
echo ""
echo "Starting all production services..."
docker-compose -f docker-compose.yml -f docker-compose.production.yml up -d

echo ""
echo "╔════════════════════════════════════════╗"
echo "║                                        ║"
echo "║   🎉 AZORA.WORLD IS LIVE! 🎉         ║"
echo "║                                        ║"
echo "╚════════════════════════════════════════╝"
echo ""
echo "🌍 https://www.azora.world"
echo "📧 support@azora.world"
echo "📱 Download app at: https://azora.world/app"
echo ""
echo "🚀 Welcome to the future!"
echo ""
