'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutGrid,
  Users,
  Activity,
  FileText,
  BarChart3,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MenuItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  requiresSuperuser?: boolean;
}

interface UserData {
  role?: string;
  roles?: string[];
  is_superuser?: boolean;
}

const menuItems: MenuItem[] = [
  {
    label: 'Dashboard',
    href: '/admin',
    icon: LayoutGrid,
  },
  {
    label: 'Users',
    href: '/admin/users',
    icon: Users,
  },
  {
    label: 'Monitoring',
    href: '/admin/monitoring',
    icon: Activity,
  },
  {
    label: 'Audit Logs',
    href: '/admin/audit',
    icon: FileText,
  },
  {
    label: 'Analytics',
    href: '/admin/analytics-verify',
    icon: BarChart3,
    requiresSuperuser: true,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isSuperuser, setIsSuperuser] = useState(false);

  useEffect(() => {
    checkSuperuserStatus();
  }, []);

  const checkSuperuserStatus = () => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        setIsSuperuser(false);
        return;
      }

      const user: UserData = JSON.parse(userStr);
      const userRole = user.role || (user.roles && user.roles[0]);
      setIsSuperuser(userRole === 'SUPERUSER' || user.is_superuser === true);
    } catch (error) {
      console.error('Error checking superuser status:', error);
      setIsSuperuser(false);
    }
  };

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  const filteredMenuItems = menuItems.filter(item => {
    if (item.requiresSuperuser) {
      return isSuperuser;
    }
    return true;
  });

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800 rounded-lg border border-gray-700 hover:bg-gray-700 transition-colors"
        aria-label="Toggle sidebar"
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <Menu className="h-6 w-6 text-white" />
        )}
      </button>

      {/* Overlay for mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <nav
        className={cn(
          'fixed top-0 left-0 h-screen w-64 bg-gray-900 border-r border-gray-800 z-40',
          'lg:translate-x-0 transition-transform duration-300',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
        aria-label="Admin navigation"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-800">
            <h2 className="text-2xl font-bold text-white">Admin</h2>
            <p className="text-sm text-gray-400 mt-1">System Management</p>
          </div>

          {/* Menu Items */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                    'hover:bg-gray-800 group',
                    active && 'bg-blue-600/20 border border-blue-600/30 text-blue-400',
                    !active && 'text-gray-300 hover:text-white'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-5 w-5 transition-colors',
                      active && 'text-blue-400',
                      !active && 'text-gray-400 group-hover:text-white'
                    )}
                  />
                  <span className="font-medium">{item.label}</span>
                  {active && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="ml-auto h-2 w-2 rounded-full bg-blue-400"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-800">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
            >
              <LayoutGrid className="h-5 w-5" />
              <span className="font-medium">Back to Dashboard</span>
            </Link>
          </div>
        </div>
      </nav>
    </>
  );
}
