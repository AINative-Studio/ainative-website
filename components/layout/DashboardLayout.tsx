'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
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

  return (
    <div className="min-h-screen bg-vite-bg text-white">
      {/* Mobile Menu Button - positioned below the global header */}
      <div className="md:hidden fixed top-24 left-4 z-30">
        <button
          onClick={toggleSidebar}
          className="rounded-md bg-[#161B22] text-gray-400 hover:text-white hover:bg-gray-700 p-2 border border-gray-800"
          aria-label="Toggle menu"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <Sidebar isMobile onClose={() => setSidebarOpen(false)} />
      )}

      {/* Desktop Sidebar - fixed position */}
      <aside className="hidden md:flex fixed left-0 top-20 w-72 h-[calc(100vh-5rem)] bg-vite-bg border-r border-[#1C2128] flex-col overflow-y-auto p-5 text-white z-20">
        <Sidebar />
      </aside>

      {/* Main Content - offset for sidebar on desktop */}
      <main className="p-4 md:p-6 md:ml-72">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
