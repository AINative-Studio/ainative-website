'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

/**
 * Conditionally renders Header and Footer based on the current route.
 * Dashboard pages have their own DashboardLayout with sidebar-aware Header/Footer,
 * so we don't render the global Header/Footer on those pages.
 */
export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();

  // Dashboard pages use DashboardLayout which has its own Header/Footer
  const isDashboardRoute = pathname?.startsWith('/dashboard');

  return (
    <>
      {!isDashboardRoute && <Header />}
      <main className="min-h-screen">{children}</main>
      {!isDashboardRoute && <Footer />}
    </>
  );
}
