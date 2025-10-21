#!/usr/bin/env bash
# scripts/verify_file_headers.sh
# Verifies that each source file contains the required file header and integration map

set -euo pipefail

ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)

# File extensions to check
EXTENSIONS=(".ts" ".tsx" ".js" ".jsx" ".py" ".go" ".md")

# Exclude paths (node_modules, dist, .git, public, docs generated files)
EXCLUDES=("node_modules" "dist" ".git" "public" "dist" "build" "coverage" "vendor")

missing=0

# Helper: check if path should be excluded
should_exclude() {
  local path="$1"
  for e in "${EXCLUDES[@]}"; do
    if [[ "$path" == *"/$e"* ]]; then
      return 0
    fi
  done
  return 1
}

# Find files and check headers
echo "🔎 Verifying file headers per NO_CODE_LEFT_BEHIND policy..."

while IFS= read -r -d '' file; do
  rel=${file#"$ROOT_DIR/"}

  # Skip excluded
  if should_exclude "$rel"; then
    continue
  fi

  # Only check specified extensions
  ok_ext=false
  for ext in "${EXTENSIONS[@]}"; do
    if [[ "$file" == *"$ext" ]]; then
      ok_ext=true
      break
    fi
  done
  $ok_ext || continue

  # Read first 60 lines
  header=$(head -n 60 "$file" || true)

  if ! echo "$header" | grep -q "@file" >/dev/null 2>&1; then
    echo "❌ MISSING HEADER: $rel (no @file tag)"
    missing=$((missing+1))
    continue
  fi

  if ! echo "$header" | grep -q "INTEGRATION MAP\|@integrates_with" >/dev/null 2>&1; then
    echo "❌ MISSING INTEGRATION MAP: $rel (no INTEGRATION MAP or @integrates_with)"
    missing=$((missing+1))
    continue
  fi

  # Optionally check for @author and @created
  if ! echo "$header" | grep -q "@author" >/dev/null 2>&1; then
    echo "⚠️  HEADER WARNING: $rel (missing @author)"
  fi
  if ! echo "$header" | grep -q "@created" >/dev/null 2>&1; then
    echo "⚠️  HEADER WARNING: $rel (missing @created)"
  fi

done < <(find "$ROOT_DIR" -type f -print0)

if [ "$missing" -gt 0 ]; then
  echo "\n🚨 Header verification failed: $missing file(s) missing required metadata."
  echo "Follow /templates/FILE_HEADER.md or run scripts/add_header.sh to fix files."
  exit 2
fi

echo "✅ All checked files contain required headers and integration maps."
exit 0
