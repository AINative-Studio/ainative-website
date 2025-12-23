'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart2, CreditCard, LogOut, Settings, User,
  Bell, Repeat, FileText, Sliders, X,
  ChevronRight, Database, Zap, Code,
  Server, Wrench, Home, Network, Package, Users, Receipt, GitBranch,
  Shield, Cpu, Activity
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useIsAdmin } from '@/components/guards/AdminRouteGuard';

interface SidebarProps {
  isMobile?: boolean;
  onClose?: () => void;
}

const menuSections = [
  {
    title: 'Developer',
    links: [
      { name: 'Overview', to: '/dashboard', icon: Home },
      { name: 'Main Dashboard', to: '/dashboard/main', icon: BarChart2 },
      { name: 'AI Models', to: '/dashboard/ai-settings', icon: Cpu },
      { name: 'AI Usage', to: '/dashboard/ai-usage', icon: Activity },
      { name: 'Agent Swarm', to: '/dashboard/agent-swarm', icon: GitBranch },
      { name: 'Developer Settings', to: '/developer-settings', icon: Code },
      { name: 'Developer Tools', to: '/developer-tools', icon: Wrench },
      { name: 'MCP Servers', to: '/dashboard/mcp-hosting', icon: Server },
      { name: 'ZeroDB', to: '/dashboard/zerodb', icon: Database },
      { name: 'API Sandbox', to: '/dashboard/api-sandbox', icon: Package },
      { name: 'Load Testing', to: '/dashboard/load-testing', icon: Zap },
      { name: 'QNN', to: '/dashboard/qnn', icon: Network }
    ]
  },
  {
    title: 'Admin',
    adminOnly: true,
    links: [
      { name: 'Admin Dashboard', to: '/admin', icon: Shield },
    ]
  },
  {
    title: 'User',
    links: [
      { name: 'Profile', to: '/profile', icon: User },
      { name: 'Account', to: '/account', icon: Users },
      { name: 'Usage', to: '/dashboard/usage', icon: BarChart2 },
      { name: 'Plan Management', to: '/plan', icon: Sliders },
      { name: 'Billing', to: '/billing', icon: CreditCard },
      { name: 'Invoices', to: '/invoices', icon: Receipt },
      { name: 'Credit History', to: '/credit-history', icon: FileText },
      { name: 'Automatic Refills', to: '/refills', icon: Repeat },
      { name: 'Notifications', to: '/notifications', icon: Bell },
      { name: 'Settings', to: '/settings', icon: Settings }
    ]
  }
];

export default function Sidebar({ isMobile = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const isAdmin = useIsAdmin();

  // Check if a path is active, handling both exact matches and nested routes
  const isActive = (path: string) => {
    // Exact match for dashboard homepage
    if (path === '/dashboard' && pathname === '/dashboard') {
      return true;
    }
    // For other routes, check if the current path starts with the menu item path
    // but don't match dashboard to all its sub-routes
    if (path !== '/dashboard' && pathname.startsWith(path)) {
      return true;
    }
    return false;
  };

  // Animation variants
  const listVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    show: { opacity: 1, x: 0, transition: { duration: 0.2 } }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full">
      <div className="space-y-8">
        {menuSections.filter((section) => {
          // Filter out admin-only sections for non-admin users
          if (section.adminOnly && !isAdmin) {
            return false;
          }
          return true;
        }).map((section) => (
          <motion.div
            key={section.title}
            initial="hidden"
            animate="show"
            variants={listVariants}
            className="mb-1"
          >
            <p className="text-xs font-semibold uppercase text-gray-400 mb-3 pl-1 tracking-wider">
              {section.title}
            </p>
            <nav className="space-y-1">
              {section.links.filter((item) => {
                // Filter out Invoices menu item for non-admin users
                if (item.name === 'Invoices' && !isAdmin) {
                  return false;
                }
                return true;
              }).map((item) => {
                const Icon = item.icon;
                const active = isActive(item.to);
                return (
                  <motion.div key={item.name} variants={itemVariants}>
                    <Link
                      href={item.to}
                      className={`flex items-center justify-between w-full px-3 py-2.5 text-sm rounded-md transition-all ${active
                        ? 'bg-primary/20 text-white font-medium border-l-2 border-primary'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800/40'
                        }`}
                      onClick={isMobile ? onClose : undefined}
                    >
                      <span className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${active ? 'text-primary' : ''}`} />
                        {item.name}
                      </span>
                      {active && (
                        <ChevronRight className="w-4 h-4 text-primary" />
                      )}
                    </Link>
                  </motion.div>
                );
              })}
            </nav>
          </motion.div>
        ))}
      </div>

      <div className="mt-auto pt-6 border-t border-gray-800">
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-400 hover:text-white hover:bg-gray-800/40 rounded-md transition-colors w-full group"
        >
          <LogOut className="w-4 h-4 group-hover:text-primary transition-colors" />
          <span>Logout</span>
        </motion.button>
      </div>
    </div>
  );

  // Mobile sidebar with backdrop overlay
  if (isMobile) {
    return (
      <div className="fixed inset-0 z-50 sidebar-container">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
          aria-hidden="true"
        />
        <motion.div
          initial={{ x: -280 }}
          animate={{ x: 0 }}
          exit={{ x: -280 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="w-72 h-full bg-[#0D1117] shadow-xl p-5 overflow-y-auto relative z-50 border-r border-gray-800"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-r from-primary to-[#FF8A3D] w-8 h-8 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">A</span>
              </div>
              <Link href="/" className="text-lg font-bold hover:underline">
                AINative
              </Link>
            </div>
            <button
              onClick={onClose}
              aria-label="Close Sidebar"
              className="p-1.5 rounded-md hover:bg-gray-800 transition-colors focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <X className="w-5 h-5 text-gray-400 hover:text-white" />
            </button>
          </div>
          {sidebarContent}
        </motion.div>
      </div>
    );
  }

  // Desktop sidebar
  return (
    <aside className="w-72 bg-[#0D1117] border-r border-[#1C2128] h-[calc(100vh-64px)] sticky top-[64px] hidden md:flex flex-col overflow-y-auto p-5 text-white">
      {sidebarContent}
    </aside>
  );
}
