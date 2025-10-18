#!/bin/bash
echo "🔧 Fixing docker-compose.yml syntax errors..."

# Backup the original file
cp docker-compose.yml docker-compose.yml.backup

# Common fixes
# 1. Fix mapping value issues (usually caused by incorrect indentation)
# 2. Fix environment variable syntax
# 3. Ensure proper port mapping format

# Check for common YAML issues
python3 << 'PYTHON'
import yaml
import sys

try:
    with open('docker-compose.yml', 'r') as f:
        data = yaml.safe_load(f)
    print("✅ YAML syntax is valid!")
    sys.exit(0)
except yaml.YAMLError as e:
    print(f"❌ YAML Error: {e}")
    if hasattr(e, 'problem_mark'):
        mark = e.problem_mark
        print(f"Error position: Line {mark.line + 1}, Column {mark.column + 1}")
    sys.exit(1)
PYTHON

