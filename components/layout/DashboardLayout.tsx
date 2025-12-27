'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import Header from './Header';
import Sidebar from './Sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Toggle mobile sidebar
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Auto-close sidebar on route change in mobile view
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  // Intentionally calling setState on route/mobile changes
  // eslint-disable-next-line react-hooks/set-state-in-effect
  }, [pathname, isMobile]);

  // Close if clicking outside on mobile
  useEffect(() => {
    if (!isMobile || !sidebarOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.sidebar-container')) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sidebarOpen, isMobile]);

  // Get page title from pathname
  const getPageTitle = () => {
    if (pathname === '/dashboard') return 'Overview';
    if (pathname === '/dashboard/main') return 'Main Dashboard';
    if (pathname === '/plan') return 'Plan Management';
    if (pathname === '/billing') return 'Billing';
    if (pathname.includes('agent-swarm')) return 'Agent Swarm';
    if (pathname.includes('zerodb')) return 'ZeroDB';
    if (pathname.includes('qnn')) return 'QNN';
    return 'AINative';
  };

  return (
    <div className="min-h-screen bg-[#0D1117] text-white">
      {/* Header */}
      <div className="relative">
        {/* Desktop Header */}
        <div className="hidden md:block">
          <Header />
        </div>

        {/* Mobile Header */}
        <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-[#161B22] border-b border-gray-800 flex items-center h-16 px-4">
          <button
            onClick={toggleSidebar}
            className="rounded-md text-gray-400 hover:text-white hover:bg-gray-700 p-2"
            aria-label="Toggle menu"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1 text-center text-lg font-semibold">
            {getPageTitle()}
          </div>
          <div className="w-10"></div> {/* Right-side spacer */}
        </div>
      </div>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <Sidebar isMobile onClose={() => setSidebarOpen(false)} />
      )}

      {/* Layout Body */}
      <div className="flex pt-16 md:pt-20">
        {/* Desktop Sidebar */}
        <div className="hidden md:block fixed left-0 top-0 h-full z-20">
          <Sidebar />
        </div>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto w-full md:ml-72">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
