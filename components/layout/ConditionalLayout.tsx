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
 * All other routes show Header and Footer normally.
 */

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

// Routes that use DashboardLayout and should NOT have ConditionalLayout's Header/Footer
const DASHBOARD_ROUTES = [
  '/dashboard',
  '/plan',
  '/billing',
  '/invoices',
  '/developer-settings',
  '/developer-tools',
  '/developer',
  '/api-keys',
  '/settings',
  '/refills',
  '/purchase-credits',
  '/profile',
  '/account',
  '/credit-history',
  '/notifications',
  '/admin',
];

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();

  // Dashboard routes where Header/Footer should NOT be rendered
  const isDashboardRoute = pathname && (
    DASHBOARD_ROUTES.some(route =>
      pathname === route || pathname.startsWith(`${route}/`)
    )
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
