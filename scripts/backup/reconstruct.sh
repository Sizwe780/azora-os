#!/bin/bash
SNAPSHOT_DIR="/workspaces/azora-os/services/ledger/snapshots"
SLICES_DIR="$SNAPSHOT_DIR/erasure"
OUTPUT_DIR="$SNAPSHOT_DIR/reconstructed"

mkdir -p $OUTPUT_DIR

cat $SLICES_DIR/slice-*.bin > $OUTPUT_DIR/reconstructed.root

echo "Reconstructed snapshot saved to $OUTPUT_DIR/reconstructed.root"
