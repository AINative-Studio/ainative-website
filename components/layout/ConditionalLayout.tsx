'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';

/**
 * ConditionalLayout - Renders Header and Footer conditionally based on route
 *
 * Issue #466: Dashboard footer hidden behind sidebar
 * Issue #472: Double footer rendering on dashboard pages
 *
 * This component prevents Header/Footer from rendering on dashboard routes
 * where DashboardLayout handles its own Header and Footer placement.
 *
 * Routes that hide Header/Footer (dashboard routes):
 * - /dashboard/*
 * - /plan
 * - /billing
 * - /developer-settings
 * - /api-keys
 * - /settings
 * - /refills
 * - /purchase-credits
 *
 * All other routes show Header and Footer normally.
 */

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

// Routes where DashboardLayout handles its own Header/Footer
// Keep in sync with layouts that use DashboardLayout
const DASHBOARD_ROUTE_PREFIXES = [
  '/dashboard',
  '/plan',
  '/billing',
  '/developer-settings',
  '/api-keys',
  '/settings',
  '/refills',
  '/purchase-credits',
  '/account',
  '/credit-history',
  '/invoices',
  '/profile',
  '/team',
];

function isDashboardPath(path: string | null): boolean {
  if (!path) return false;
  const normalizedPath = path.toLowerCase();
  return DASHBOARD_ROUTE_PREFIXES.some(prefix =>
    normalizedPath === prefix || normalizedPath.startsWith(prefix + '/')
  );
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();

  // On dashboard routes, only render children (no Header/Footer)
  // DashboardLayout handles its own Header and Footer
  if (isDashboardPath(pathname)) {
    return <>{children}</>;
  }

  // On non-dashboard routes, render Header, children, and Footer
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}
