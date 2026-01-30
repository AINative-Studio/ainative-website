#!/bin/bash

echo "==================================="
echo "AI-Kit Implementation Verification"
echo "==================================="
echo ""

echo "1. Checking implementation files..."
FILES=(
  "components/ai-kit/AIKitShowcase.tsx"
  "components/ai-kit/ComponentDemo.tsx"
  "components/ai-kit/__tests__/AIKitShowcase.test.tsx"
  "components/ai-kit/__tests__/ComponentDemo.test.tsx"
  "components/ai-kit/README.md"
  "components/ai-kit/IMPLEMENTATION_SUMMARY.md"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    lines=$(wc -l < "$file" | tr -d ' ')
    echo "  ✅ $file ($lines lines)"
  else
    echo "  ❌ $file (MISSING)"
  fi
done

echo ""
echo "2. Running tests with coverage..."
npm test -- components/ai-kit/__tests__/ --coverage --collectCoverageFrom='components/ai-kit/**/*.{ts,tsx}' --coverageReporters=text-summary --no-coverage-threshold 2>&1 | grep -A 5 "Coverage summary"

echo ""
echo "3. File structure..."
tree components/ai-kit/ 2>/dev/null || find components/ai-kit/ -type f

echo ""
echo "==================================="
echo "Verification Complete"
echo "==================================="
