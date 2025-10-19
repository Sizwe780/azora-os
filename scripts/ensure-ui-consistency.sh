#!/bin/bash
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🎨 Enforcing UI Coherence (Article IX)...${NC}"

SOURCE_DIR="/workspaces/azora-os/UI Overhaul/src"
TARGET_DIR="/workspaces/azora-os/apps/main-app/src"

if [ ! -d "$SOURCE_DIR" ]; then
    echo "❌ Critical: UI Overhaul source directory not found. Aborting."
    exit 1
fi

echo "Creating target application structure..."
mkdir -p "$TARGET_DIR"

echo "Synchronizing pages and components..."
# Use rsync for efficient and safe synchronization
rsync -av --delete "$SOURCE_DIR/" "$TARGET_DIR/"

echo -e "${GREEN}✅ UI Coherence mandate has been met.${NC}"
