#!/bin/bash

# Debug build script to help identify Docker build issues

echo "=== Docker Build Debug Information ==="
echo "Timestamp: $(date)"
echo ""

echo "=== Node Version ==="
node --version

echo ""
echo "=== NPM Version ==="
npm --version

echo ""
echo "=== TypeScript Configuration ==="
echo "Checking tsconfig.json..."
if [ -f tsconfig.json ]; then
    echo "✓ tsconfig.json exists"
    echo "Include patterns:"
    cat tsconfig.json | grep -A 10 '"include"'
    echo ""
    echo "Exclude patterns:"
    cat tsconfig.json | grep -A 10 '"exclude"'
else
    echo "✗ tsconfig.json missing"
fi

echo ""
echo "=== Package.json Build Script ==="
cat package.json | grep '"build"'

echo ""
echo "=== Checking for .d.ts files ==="
find . -name "*.d.ts" -not -path "./node_modules/*" 2>/dev/null || echo "No .d.ts files found"

echo ""
echo "=== Cleaning build artifacts ==="
rm -rf dist
rm -rf node_modules/.cache
rm -f *.tsbuildinfo
rm -f vite.config.d.ts
echo "✓ Build artifacts cleaned"

echo ""
echo "=== Testing TypeScript compilation ==="
npx tsc --noEmit
if [ $? -eq 0 ]; then
    echo "✓ TypeScript compilation successful"
else
    echo "✗ TypeScript compilation failed"
    exit 1
fi

echo ""
echo "=== Testing Vite build ==="
npx vite build
if [ $? -eq 0 ]; then
    echo "✓ Vite build successful"
else
    echo "✗ Vite build failed"
    exit 1
fi

echo ""
echo "=== Build debug completed successfully ==="