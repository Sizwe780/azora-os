#!/bin/bash
# filepath: /workspaces/azora-os/clean-and-organize.sh

echo "🧹 Organizing Azora OS repo: Moving scripts away, keeping only essentials..."

# Create a tools/ directory outside the main repo structure for scripts
mkdir -p ../azora-tools

# Move all scripts to ../azora-tools/ (away from repo)
if [ -d scripts/ ]; then
  mv scripts/* ../azora-tools/ 2>/dev/null || true
  rmdir scripts/ 2>/dev/null || true
fi

# Move loose scripts in root to ../azora-tools/
for script in valuation.sh check-million.sh deploy-enhancements.sh; do
  if [ -f "$script" ]; then
    mv "$script" ../azora-tools/
  fi
done

# Ensure only essential directories/files remain in repo
# Core: services/, azora-coin/, docs/, apps/, infrastructure/, .env, package.json, README.md, start-all.sh, etc.
# Remove any non-essential clutter (but don't delete working files)
find . -maxdepth 1 -name "*.tmp" -delete
find . -maxdepth 1 -name "*.log" -delete
find . -maxdepth 1 -name "*.bak" -delete

echo "✅ Repo organized. Scripts moved to ../azora-tools/. Only essentials remain."
echo "To run scripts: cd ../azora-tools && ./script-name.sh"