#!/bin/bash
echo "Scanning for hard-coded secrets..."
grep -rniE "0x[a-fA-F0-9]{64}|sk_[a-zA-Z0-9]{20,}|PRIVATE_KEY" \
  --exclude-dir={node_modules,.git,dist,build} /workspaces/azora-os
echo "Scan complete. If any secrets were found above, replace them with environment variables."
