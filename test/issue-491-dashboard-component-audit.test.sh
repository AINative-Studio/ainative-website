#!/bin/bash

# Test script for Issue #491: Dashboard Component Count Discrepancy
# RED Phase - Write failing tests first, then conduct audit to make them pass

set -e

echo "=========================================="
echo "Testing Dashboard Component Audit"
echo "=========================================="
echo ""

AUDIT_REPORT="docs/dashboard-component-audit-report.md"
EXIT_CODE=0

# Test 1: Verify audit report exists
echo "[TEST 1] Checking if audit report exists..."
if [ ! -f "$AUDIT_REPORT" ]; then
    echo "❌ FAIL: Audit report not found at $AUDIT_REPORT"
    EXIT_CODE=1
else
    echo "✅ PASS: Audit report exists"
fi
echo ""

# Test 2: Verify report contains source component inventory
echo "[TEST 2] Checking for source component inventory..."
if [ -f "$AUDIT_REPORT" ]; then
    if grep -q "## Source Dashboard Components" "$AUDIT_REPORT"; then
        echo "✅ PASS: Source component inventory section found"
    else
        echo "❌ FAIL: Source component inventory section missing"
        EXIT_CODE=1
    fi
else
    echo "⏭️  SKIP: Report does not exist yet"
    EXIT_CODE=1
fi
echo ""

# Test 3: Verify report contains component mapping
echo "[TEST 3] Checking for component mapping..."
if [ -f "$AUDIT_REPORT" ]; then
    if grep -q "## Component Mapping" "$AUDIT_REPORT"; then
        echo "✅ PASS: Component mapping section found"
    else
        echo "❌ FAIL: Component mapping section missing"
        EXIT_CODE=1
    fi
else
    echo "⏭️  SKIP: Report does not exist yet"
    EXIT_CODE=1
fi
echo ""

# Test 4: Verify report contains usage analysis
echo "[TEST 4] Checking for usage analysis..."
if [ -f "$AUDIT_REPORT" ]; then
    if grep -q "## Usage Analysis" "$AUDIT_REPORT"; then
        echo "✅ PASS: Usage analysis section found"
    else
        echo "❌ FAIL: Usage analysis section missing"
        EXIT_CODE=1
    fi
else
    echo "⏭️  SKIP: Report does not exist yet"
    EXIT_CODE=1
fi
echo ""

# Test 5: Verify report contains migration status
echo "[TEST 5] Checking for migration status tracking..."
if [ -f "$AUDIT_REPORT" ]; then
    if grep -q "Migration Status" "$AUDIT_REPORT" || grep -q "Status:" "$AUDIT_REPORT"; then
        echo "✅ PASS: Migration status tracking found"
    else
        echo "❌ FAIL: Migration status tracking missing"
        EXIT_CODE=1
    fi
else
    echo "⏭️  SKIP: Report does not exist yet"
    EXIT_CODE=1
fi
echo ""

# Test 6: Verify report contains categorization (used/unused)
echo "[TEST 6] Checking for component categorization..."
if [ -f "$AUDIT_REPORT" ]; then
    if grep -qi "actively used\|legacy\|deprecated\|unused" "$AUDIT_REPORT"; then
        echo "✅ PASS: Component categorization found"
    else
        echo "❌ FAIL: Component categorization missing"
        EXIT_CODE=1
    fi
else
    echo "⏭️  SKIP: Report does not exist yet"
    EXIT_CODE=1
fi
echo ""

# Test 7: Verify report contains recommendations
echo "[TEST 7] Checking for recommendations..."
if [ -f "$AUDIT_REPORT" ]; then
    if grep -q "## Recommendations" "$AUDIT_REPORT" || grep -q "## Migration Roadmap" "$AUDIT_REPORT"; then
        echo "✅ PASS: Recommendations section found"
    else
        echo "❌ FAIL: Recommendations section missing"
        EXIT_CODE=1
    fi
else
    echo "⏭️  SKIP: Report does not exist yet"
    EXIT_CODE=1
fi
echo ""

# Test 8: Verify report contains at least 20+ components documented
echo "[TEST 8] Checking component count (minimum 20)..."
if [ -f "$AUDIT_REPORT" ]; then
    # Count component entries (looking for common patterns like "###" or "- **")
    COMPONENT_COUNT=$(grep -c "^###\|^- \*\*" "$AUDIT_REPORT" || true)
    if [ "$COMPONENT_COUNT" -ge 20 ]; then
        echo "✅ PASS: Found $COMPONENT_COUNT components documented (>= 20)"
    else
        echo "❌ FAIL: Only $COMPONENT_COUNT components documented (expected >= 20)"
        EXIT_CODE=1
    fi
else
    echo "⏭️  SKIP: Report does not exist yet"
    EXIT_CODE=1
fi
echo ""

# Test 9: Verify report contains missing components identification
echo "[TEST 9] Checking for missing components identification..."
if [ -f "$AUDIT_REPORT" ]; then
    if grep -qi "missing\|not migrated\|not found" "$AUDIT_REPORT"; then
        echo "✅ PASS: Missing components identification found"
    else
        echo "❌ FAIL: Missing components identification not found"
        EXIT_CODE=1
    fi
else
    echo "⏭️  SKIP: Report does not exist yet"
    EXIT_CODE=1
fi
echo ""

# Test 10: Verify report contains Next.js equivalents
echo "[TEST 10] Checking for Next.js equivalent components..."
if [ -f "$AUDIT_REPORT" ]; then
    if grep -q "Next.js" "$AUDIT_REPORT" && grep -q "app/" "$AUDIT_REPORT"; then
        echo "✅ PASS: Next.js equivalents documented"
    else
        echo "❌ FAIL: Next.js equivalents not documented"
        EXIT_CODE=1
    fi
else
    echo "⏭️  SKIP: Report does not exist yet"
    EXIT_CODE=1
fi
echo ""

# Summary
echo "=========================================="
if [ $EXIT_CODE -eq 0 ]; then
    echo "✅ ALL TESTS PASSED"
    echo "Dashboard component audit is complete and verified"
else
    echo "❌ SOME TESTS FAILED"
    echo "Complete the audit to make all tests pass"
fi
echo "=========================================="

exit $EXIT_CODE
