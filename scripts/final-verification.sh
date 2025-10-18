#!/bin/bash
echo "🔍 FINAL VERIFICATION"
echo "===================="
echo ""

check() {
  if [ -f "$1" ]; then
    echo "✅ $2"
    return 0
  else
    echo "❌ $2"
    return 1
  fi
}

PASS=0
FAIL=0

check "services/auto-healing/index.js" "Auto-healing" && PASS=$((PASS+1)) || FAIL=$((FAIL+1))
check "services/azora-ai-consciousness/index.js" "AI consciousness" && PASS=$((PASS+1)) || FAIL=$((FAIL+1))
check "scripts/auto-backup.sh" "Auto-backup" && PASS=$((PASS+1)) || FAIL=$((FAIL+1))
check "frontend/public/manifest.json" "PWA manifest" && PASS=$((PASS+1)) || FAIL=$((FAIL+1))
check "LICENSE" "License" && PASS=$((PASS+1)) || FAIL=$((FAIL+1))
check "README.md" "README" && PASS=$((PASS+1)) || FAIL=$((FAIL+1))

echo ""
if [ $FAIL -eq 0 ]; then
  echo "✅ ALL CHECKS PASSED ($PASS/6)"
  exit 0
else
  echo "❌ $FAIL CHECKS FAILED"
  exit 1
fi
