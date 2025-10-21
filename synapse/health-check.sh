#!/bin/bash

# Azora World Portal - Health Check Script
# Run this script to verify deployment health

echo "🔍 Azora World Portal - Health Check"
echo "===================================="

BASE_URL="http://localhost:5173"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

echo "📅 Check Time: $TIMESTAMP"
echo ""

# Function to check URL
check_url() {
    local url=$1
    local expected_code=${2:-200}
    local description=$3

    echo -n "🔗 $description: "
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url")

    if [ "$response" -eq "$expected_code" ]; then
        echo "✅ PASS ($response)"
    else
        echo "❌ FAIL ($response)"
    fi
}

# Core Pages
check_url "$BASE_URL/" 200 "Homepage"
check_url "$BASE_URL/services" 200 "Services Page"
check_url "$BASE_URL/about" 200 "About Page"
check_url "$BASE_URL/contact" 200 "Contact Page"
check_url "$BASE_URL/news" 200 "News Page"
check_url "$BASE_URL/privacy" 200 "Privacy Page"
check_url "$BASE_URL/terms" 200 "Terms Page"

echo ""

# SEO & Technical
check_url "$BASE_URL/sitemap.xml" 200 "Sitemap"
check_url "$BASE_URL/robots.txt" 200 "Robots.txt"

echo ""

# Performance Check (basic)
echo "⚡ Performance Check:"
response_time=$(curl -s -o /dev/null -w "%{time_total}" "$BASE_URL/")
echo "   Homepage load time: ${response_time}s"

# SSL Check
echo ""
echo "🔒 SSL Check:"
ssl_expiry=$(openssl s_client -connect azora.world:443 -servername azora.world < /dev/null 2>/dev/null | openssl x509 -noout -dates 2>/dev/null | grep notAfter | cut -d'=' -f2)
if [ -n "$ssl_expiry" ]; then
    echo "   SSL expires: $ssl_expiry"
else
    echo "   ❌ SSL check failed"
fi

echo ""
echo "📊 Ecosystem Stats Check:"
# Check if stats component loads (basic check)
stats_check=$(curl -s "$BASE_URL/" | grep -o "Live Ecosystem Stats" | wc -l)
if [ "$stats_check" -gt 0 ]; then
    echo "   ✅ Ecosystem stats component present"
else
    echo "   ❌ Ecosystem stats component missing"
fi

echo ""
echo "🎯 Authentication Check:"
# Check if auth elements are present
auth_check=$(curl -s "$BASE_URL/" | grep -o "Sign In\|Get Started" | wc -l)
if [ "$auth_check" -gt 0 ]; then
    echo "   ✅ Authentication elements present"
else
    echo "   ❌ Authentication elements missing"
fi

echo ""
echo "✅ Health check complete!"
echo "📧 Report generated at $TIMESTAMP"