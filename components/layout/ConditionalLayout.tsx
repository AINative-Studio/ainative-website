'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';

/**
 * ConditionalLayout - Renders Header and Footer conditionally based on route
 *
 * Issue #466: Dashboard footer hidden behind sidebar
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

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();

  // Dashboard routes where Header/Footer should NOT be rendered
  const isDashboardRoute = pathname && (
    pathname.toLowerCase().startsWith('/dashboard') ||
    pathname === '/plan' ||
    pathname === '/billing' ||
    pathname === '/developer-settings' ||
    pathname === '/api-keys' ||
    pathname === '/settings' ||
    pathname === '/refills' ||
    pathname === '/purchase-credits'
  );

  // On dashboard routes, only render children (no Header/Footer)
  if (isDashboardRoute) {
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
