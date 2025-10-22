#!/bin/bash

# Build script with license check

echo "Running license check..."
npm run license-check

if [ $? -ne 0 ]; then
    echo "License check failed. Aborting build."
    exit 1
fi

echo "License check passed. Proceeding with build..."
npm run build

echo "Build completed successfully."