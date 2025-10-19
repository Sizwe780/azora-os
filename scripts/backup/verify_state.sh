#!/bin/bash
RECONSTRUCTED_FILE="/workspaces/azora-os/services/ledger/snapshots/reconstructed/reconstructed.root"
EXPECTED_ROOT="0x123"

ACTUAL_ROOT=$(jq -r '.stateroot' $RECONSTRUCTED_FILE)

if [ "$ACTUAL_ROOT" == "$EXPECTED_ROOT" ]; then
  echo "✅ State root verified"
else
  echo "❌ State root mismatch"
fi
