#!/bin/bash

# Test script for Issue #339 - Webinar Registration Hook
# Tests hook implementation, API endpoints, and integration

set -e

PROJECT_ROOT="/Users/aideveloper/ainative-website-nextjs-staging"
ERRORS=0

echo "Testing Issue #339 - Webinar Registration Hook"
echo "================================================"
echo ""

# Test 1: Verify hook file exists
echo "Test 1: Verify hook file exists..."
if [ -f "$PROJECT_ROOT/hooks/useWebinarRegistration.ts" ]; then
  echo "  ✓ useWebinarRegistration.ts exists"
else
  echo "  ✗ useWebinarRegistration.ts not found"
  ERRORS=$((ERRORS + 1))
fi
echo ""

# Test 2: Verify Zod schema implementation
echo "Test 2: Verify Zod schema implementation..."
if grep -q "import { z } from 'zod'" "$PROJECT_ROOT/hooks/useWebinarRegistration.ts"; then
  echo "  ✓ Zod import found"
else
  echo "  ✗ Zod import not found"
  ERRORS=$((ERRORS + 1))
fi

if grep -q "registrationSchema = z.object" "$PROJECT_ROOT/hooks/useWebinarRegistration.ts"; then
  echo "  ✓ Zod schema defined"
else
  echo "  ✗ Zod schema not defined"
  ERRORS=$((ERRORS + 1))
fi

if grep -q "z.string().email" "$PROJECT_ROOT/hooks/useWebinarRegistration.ts"; then
  echo "  ✓ Email validation configured"
else
  echo "  ✗ Email validation not configured"
  ERRORS=$((ERRORS + 1))
fi

if grep -q "z.string().min(2" "$PROJECT_ROOT/hooks/useWebinarRegistration.ts"; then
  echo "  ✓ Name validation configured"
else
  echo "  ✗ Name validation not configured"
  ERRORS=$((ERRORS + 1))
fi
echo ""

# Test 3: Verify Luma API integration
echo "Test 3: Verify Luma API integration..."
if grep -q "/api/luma/events" "$PROJECT_ROOT/hooks/useWebinarRegistration.ts"; then
  echo "  ✓ Luma API endpoint configured"
else
  echo "  ✗ Luma API endpoint not configured"
  ERRORS=$((ERRORS + 1))
fi

if grep -q "fetch.*register" "$PROJECT_ROOT/hooks/useWebinarRegistration.ts"; then
  echo "  ✓ Registration fetch call implemented"
else
  echo "  ✗ Registration fetch call not implemented"
  ERRORS=$((ERRORS + 1))
fi
echo ""

# Test 4: Verify email confirmation integration
echo "Test 4: Verify email confirmation integration..."
if grep -q "/api/webinars/send-confirmation" "$PROJECT_ROOT/hooks/useWebinarRegistration.ts"; then
  echo "  ✓ Confirmation email endpoint configured"
else
  echo "  ✗ Confirmation email endpoint not configured"
  ERRORS=$((ERRORS + 1))
fi

if [ -f "$PROJECT_ROOT/app/api/webinars/send-confirmation/route.ts" ]; then
  echo "  ✓ Confirmation email API route exists"
else
  echo "  ✗ Confirmation email API route not found"
  ERRORS=$((ERRORS + 1))
fi
echo ""

# Test 5: Verify calendar export functionality
echo "Test 5: Verify calendar export functionality..."
if grep -q "downloadCalendar" "$PROJECT_ROOT/hooks/useWebinarRegistration.ts"; then
  echo "  ✓ downloadCalendar function implemented"
else
  echo "  ✗ downloadCalendar function not implemented"
  ERRORS=$((ERRORS + 1))
fi

if [ -f "$PROJECT_ROOT/app/api/webinars/[id]/calendar/route.ts" ]; then
  echo "  ✓ Calendar API route exists"
else
  echo "  ✗ Calendar API route not found"
  ERRORS=$((ERRORS + 1))
fi

if grep -q "generateICalFile" "$PROJECT_ROOT/hooks/useWebinarRegistration.ts"; then
  echo "  ✓ Calendar generation implemented"
else
  echo "  ✗ Calendar generation not implemented"
  ERRORS=$((ERRORS + 1))
fi
echo ""

# Test 6: Verify hook exports and return values
echo "Test 6: Verify hook exports and return values..."
if grep -q "export function useWebinarRegistration" "$PROJECT_ROOT/hooks/useWebinarRegistration.ts"; then
  echo "  ✓ Hook function exported"
else
  echo "  ✗ Hook function not exported"
  ERRORS=$((ERRORS + 1))
fi

if grep -q "export const registrationSchema" "$PROJECT_ROOT/hooks/useWebinarRegistration.ts"; then
  echo "  ✓ Registration schema exported"
else
  echo "  ✗ Registration schema not exported"
  ERRORS=$((ERRORS + 1))
fi

if grep -q "validate," "$PROJECT_ROOT/hooks/useWebinarRegistration.ts"; then
  echo "  ✓ Validate function returned"
else
  echo "  ✗ Validate function not returned"
  ERRORS=$((ERRORS + 1))
fi

if grep -q "isRegistering" "$PROJECT_ROOT/hooks/useWebinarRegistration.ts" && \
   grep -q "isRegistered" "$PROJECT_ROOT/hooks/useWebinarRegistration.ts"; then
  echo "  ✓ Registration state management implemented"
else
  echo "  ✗ Registration state management incomplete"
  ERRORS=$((ERRORS + 1))
fi
echo ""

# Test 7: Verify error handling
echo "Test 7: Verify error handling..."
if grep -q "catch.*error" "$PROJECT_ROOT/hooks/useWebinarRegistration.ts"; then
  echo "  ✓ Error handling implemented"
else
  echo "  ✗ Error handling not implemented"
  ERRORS=$((ERRORS + 1))
fi

if grep -q "RegistrationError" "$PROJECT_ROOT/hooks/useWebinarRegistration.ts"; then
  echo "  ✓ Error types defined"
else
  echo "  ✗ Error types not defined"
  ERRORS=$((ERRORS + 1))
fi
echo ""

# Test 8: Verify TypeScript types
echo "Test 8: Verify TypeScript types..."
if grep -q "interface RegistrationFormData" "$PROJECT_ROOT/hooks/useWebinarRegistration.ts" || \
   grep -q "type RegistrationFormData" "$PROJECT_ROOT/hooks/useWebinarRegistration.ts"; then
  echo "  ✓ RegistrationFormData type defined"
else
  echo "  ✗ RegistrationFormData type not defined"
  ERRORS=$((ERRORS + 1))
fi

if grep -q "interface RegistrationResult" "$PROJECT_ROOT/hooks/useWebinarRegistration.ts"; then
  echo "  ✓ RegistrationResult type defined"
else
  echo "  ✗ RegistrationResult type not defined"
  ERRORS=$((ERRORS + 1))
fi
echo ""

# Test 9: Verify API endpoint structure
echo "Test 9: Verify API endpoint structure..."
if grep -q "export async function POST" "$PROJECT_ROOT/app/api/webinars/send-confirmation/route.ts"; then
  echo "  ✓ Confirmation email POST handler exists"
else
  echo "  ✗ Confirmation email POST handler not found"
  ERRORS=$((ERRORS + 1))
fi

if grep -q "export async function GET" "$PROJECT_ROOT/app/api/webinars/[id]/calendar/route.ts"; then
  echo "  ✓ Calendar export GET handler exists"
else
  echo "  ✗ Calendar export GET handler not found"
  ERRORS=$((ERRORS + 1))
fi

if grep -q "NextResponse" "$PROJECT_ROOT/app/api/webinars/send-confirmation/route.ts"; then
  echo "  ✓ Next.js response handling implemented"
else
  echo "  ✗ Next.js response handling not implemented"
  ERRORS=$((ERRORS + 1))
fi
echo ""

# Test 10: Verify calendar file generation
echo "Test 10: Verify calendar file generation..."
if grep -q "text/calendar" "$PROJECT_ROOT/app/api/webinars/[id]/calendar/route.ts"; then
  echo "  ✓ Calendar MIME type configured"
else
  echo "  ✗ Calendar MIME type not configured"
  ERRORS=$((ERRORS + 1))
fi

if grep -q "Content-Disposition.*attachment" "$PROJECT_ROOT/app/api/webinars/[id]/calendar/route.ts"; then
  echo "  ✓ File download headers configured"
else
  echo "  ✗ File download headers not configured"
  ERRORS=$((ERRORS + 1))
fi

if grep -q ".ics" "$PROJECT_ROOT/app/api/webinars/[id]/calendar/route.ts"; then
  echo "  ✓ ICS file extension configured"
else
  echo "  ✗ ICS file extension not configured"
  ERRORS=$((ERRORS + 1))
fi
echo ""

# Summary
echo "================================================"
if [ $ERRORS -eq 0 ]; then
  echo "All tests passed! ✓"
  echo ""
  echo "Implementation complete:"
  echo "  - Zod validation schema"
  echo "  - Luma API integration"
  echo "  - Email confirmation endpoint"
  echo "  - Calendar export endpoint"
  echo "  - Error handling"
  echo "  - TypeScript types"
  exit 0
else
  echo "Tests failed with $ERRORS error(s) ✗"
  exit 1
fi
