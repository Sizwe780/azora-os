#!/bin/bash
echo "Checking Dockerfiles consistency..."

for dockerfile in $(find . -name "Dockerfile*"); do
  echo "Checking $dockerfile..."
  # Basic syntax check
  docker buildx build --progress=plain --no-cache -f $dockerfile -t test:latest --target build . || echo "Error in $dockerfile"
done
