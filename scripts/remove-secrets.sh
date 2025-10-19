#!/bin/bash

echo "Scanning for exposed secrets..."

# List of common secret patterns
PATTERNS=(
  "key=\"[^\"]+\""
  "key=[^\"' ]+"
  "password=\"[^\"]+\""
  "password=[^\"' ]+"
  "secret=\"[^\"]+\""
  "secret=[^\"' ]+"
  "token=\"[^\"]+\""
  "token=[^\"' ]+"
)

# Files to exclude
EXCLUDE=(
  "node_modules"
  ".git"
  "package-lock.json"
)

# Build exclude pattern
EXCLUDE_PATTERN=""
for pattern in "${EXCLUDE[@]}"; do
  EXCLUDE_PATTERN="${EXCLUDE_PATTERN} --exclude-dir=${pattern}"
done

# Find potentially exposed secrets
for pattern in "${PATTERNS[@]}"; do
  echo "Checking for pattern: ${pattern}"
  RESULTS=$(grep -r ${EXCLUDE_PATTERN} "${pattern}" --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" --include="*.json" /workspaces/azora-os | grep -v "process.env")
  
  if [ -n "$RESULTS" ]; then
    echo "Found potential secrets:"
    echo "$RESULTS"
    echo "Replacing with environment variables..."
    
    # For each file with exposed secrets, replace with env vars
    FILES=$(echo "$RESULTS" | cut -d: -f1 | sort | uniq)
    for file in $FILES; do
      echo "Fixing file: $file"
      # Replace hardcoded secrets with environment variables
      sed -i 's/\(key\|password\|secret\|token\)="\([^"]*\)"/\1=process.env.\U\1\E/g' "$file"
      sed -i 's/\(key\|password\|secret\|token\)=\([^"'\'' ]*\)/\1=process.env.\U\1\E/g' "$file"
    done
  else
    echo "No exposed secrets found for this pattern."
  fi
done

echo "Secret scanning and replacement complete."
