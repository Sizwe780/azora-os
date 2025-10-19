#!/bin/bash

# Real-time system status dashboard
watch -n 2 -c '
clear
echo "╔════════════════════════════════════════════════════════════╗"
echo "║         AZORA OS - LIVE SYSTEM STATUS DASHBOARD           ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "Services Status:"
echo "───────────────"

curl -s http://localhost:4091/health | jq -r "\"HR AI Deputy:     \" + .status" 2>/dev/null || echo "HR AI Deputy:     ❌ DOWN"
curl -s http://localhost:4004/health | jq -r "\"Auth Service:     \" + .status" 2>/dev/null || echo "Auth Service:     ❌ DOWN"
curl -s http://localhost:5005/health | jq -r "\"ARIA Assistant:   \" + .status" 2>/dev/null || echo "ARIA Assistant:   ❌ DOWN"
curl -s http://localhost:5000/health | jq -r "\"Azora Pay:        \" + .status" 2>/dev/null || echo "Azora Pay:        ❌ DOWN"

echo ""
echo "System Metrics:"
echo "───────────────"
echo "CPU Usage:        $(top -bn1 | grep "Cpu(s)" | awk "{print \$2}" | cut -d"%" -f1)%"
echo "Memory Usage:     $(free | grep Mem | awk "{printf \"%.1f%%\", \$3/\$2 * 100.0}")"
echo "Disk Usage:       $(df -h / | tail -1 | awk "{print \$5}")"

echo ""
echo "Press Ctrl+C to exit"
'
