#!/usr/bin/env bash

ROOT="/workspaces/azora/apps/azora-buildspaces/app/api"

printf "Scanning API routes for missing getServerSession/authOptions...\n\n"

for f in $(find "$ROOT" -type f -name 'route.ts'); do
  if ! grep -q "getServerSession" "$f" && ! grep -q "authOptions" "$f"; then
    echo "MISSING AUTH: $f"
  fi
done

echo "Scan complete."
