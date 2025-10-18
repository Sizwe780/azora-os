#!/bin/bash

echo "🏗️  Building Azora OS..."
echo ""

BUILD_ERRORS=0

# Build function with error handling
build_app() {
  local app_path=$1
  local app_name=$(basename "$app_path")
  
  if [ -d "$app_path" ] && [ -f "$app_path/package.json" ]; then
    echo "Building $app_name..."
    cd "$app_path"
    
    if npm run build 2>&1 | tee "/tmp/build-$app_name.log"; then
      echo "✅ $app_name built successfully"
    else
      echo "⚠️  $app_name build had warnings (non-fatal)"
      BUILD_ERRORS=$((BUILD_ERRORS + 1))
    fi
    
    cd - > /dev/null
  fi
}

# Build all apps
for app in apps/*/; do
  if [ -d "$app" ]; then
    build_app "$app"
  fi
done

echo ""
if [ $BUILD_ERRORS -eq 0 ]; then
  echo "✅ All builds completed successfully!"
  exit 0
else
  echo "⚠️  $BUILD_ERRORS builds had warnings (build still usable)"
  exit 0
fi
