#!/bin/bash

echo "🧹 Cleaning Azora OS Repository..."
echo ""

# Remove build artifacts
echo "Removing build artifacts..."
find . -name "dist" -type d -exec rm -rf {} + 2>/dev/null
find . -name "build" -type d -exec rm -rf {} + 2>/dev/null
find . -name ".cache" -type d -exec rm -rf {} + 2>/dev/null
find . -name "coverage" -type d -exec rm -rf {} + 2>/dev/null

# Remove logs
echo "Removing log files..."
find . -name "*.log" -type f -delete 2>/dev/null
find . -name "npm-debug.log*" -type f -delete 2>/dev/null

# Remove OS files
echo "Removing OS-specific files..."
find . -name ".DS_Store" -type f -delete 2>/dev/null
find . -name "Thumbs.db" -type f -delete 2>/dev/null

# Remove editor files
echo "Removing editor files..."
find . -name "*.swp" -type f -delete 2>/dev/null
find . -name "*.swo" -type f -delete 2>/dev/null
find . -name "*~" -type f -delete 2>/dev/null

# Clean git
echo "Cleaning git..."
git gc --aggressive --prune=now 2>/dev/null

echo ""
echo "✅ Repository cleaned successfully!"
echo ""
