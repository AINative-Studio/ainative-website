'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import OpenClawSidebar from '@/components/openclaw/OpenClawSidebar';

interface OpenClawLayoutProps {
  children: React.ReactNode;
}

export default function OpenClawLayout({ children }: OpenClawLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-close sidebar on route change in mobile view
  useEffect(() => {
    if (isMobile) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentional: close sidebar on route/mobile changes
      setSidebarOpen(false);
    }
  }, [pathname, isMobile]);

  return (
    <>
      {/*
        COUPLING NOTE: These global CSS overrides hide the parent DashboardLayout's
        sidebar and restyle its background for the OpenClaw section. This creates a
        dependency on the following data-testid attributes in DashboardLayout:
          - "desktop-sidebar"  (components/layout/DashboardLayout.tsx)
          - "dashboard-layout" (components/layout/DashboardLayout.tsx)
        If those test IDs change, these overrides will silently break.
        TODO: Refactor to use a context/prop-based opt-out mechanism in DashboardLayout
        instead of global CSS overrides. See: https://github.com/AINative-Studio/ainative-website/issues/TBD
      */}
      <style jsx global>{`
        [data-testid="desktop-sidebar"] {
          display: none !important;
        }
        [data-testid="dashboard-layout"] {
          background-color: #ffffff !important;
          color: #111827 !important;
        }
        [data-testid="dashboard-layout"] > .flex {
          padding-top: 0 !important;
        }
        [data-testid="dashboard-layout"] > .relative {
          display: none !important;
        }
      `}</style>

      <div className="flex min-h-screen bg-white">
        {/* Desktop Sidebar */}
        <div className="hidden md:block shrink-0 sticky top-0 h-screen overflow-y-auto">
          <OpenClawSidebar />
        </div>

        {/* Mobile header bar */}
        <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b border-gray-200 flex items-center h-14 px-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 p-2"
            aria-label="Toggle menu"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div className="flex-1 text-center text-sm font-semibold text-gray-900">
            AINative Studio
          </div>
          <div className="w-10" />
        </div>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && isMobile && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
              aria-hidden="true"
            />
            <div className="fixed inset-y-0 left-0 z-50 w-[220px]">
              <OpenClawSidebar />
            </div>
          </>
        )}

        {/* Main content */}
        <main className="flex-1 min-w-0 pt-14 md:pt-0">
          <div className="max-w-5xl mx-auto px-6 py-8 md:px-10 md:py-10">
            {children}
          </div>
        </main>
      </div>
    </>
  );
}
