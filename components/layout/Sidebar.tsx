'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    BarChart2, CreditCard, Settings, User,
    Bell, Repeat, FileText, Sliders, X,
    ChevronDown, Database, Code,
    Server, Wrench, Home, Network, Package, Users, Receipt, GitBranch,
    Cpu, Activity, Brain, DollarSign, HardDrive,
    MessageSquare, HelpCircle
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps {
    isMobile?: boolean;
    onClose?: () => void;
}

interface MenuItem {
    name: string;
    to: string;
    icon: React.ComponentType<{ className?: string }>;
}

const buildLinks: MenuItem[] = [
    { name: 'AI Models', to: '/dashboard/ai-settings', icon: Cpu },
    { name: 'ZeroDB Serverless', to: '/dashboard/zerodb', icon: Database },
    { name: 'Sessions', to: '/dashboard/sessions', icon: Brain },
    { name: 'Agent Swarm', to: '/dashboard/agent-swarm', icon: GitBranch },
    { name: 'Storage', to: '/dashboard/storage', icon: HardDrive },
    { name: 'QNN', to: '/dashboard/qnn', icon: Network },
    { name: 'My Earnings', to: '/developer/earnings', icon: DollarSign },
    { name: 'Payouts', to: '/developer/payouts', icon: CreditCard },
    { name: 'AI Usage', to: '/dashboard/ai-usage', icon: Activity },
    { name: 'MCP Servers', to: '/dashboard/mcp-hosting', icon: Server },
    { name: 'API Sandbox', to: '/dashboard/api-sandbox', icon: Package },
];

const manageLinks: MenuItem[] = [
    { name: 'Billing & Invoices', to: '/billing', icon: Receipt },
    { name: 'Developer Tools', to: '/developer-tools', icon: Wrench },
    { name: 'Developer Settings', to: '/developer-settings', icon: Code },
    { name: 'Credits History', to: '/credit-history', icon: FileText },
    { name: 'Usage', to: '/dashboard/usage', icon: BarChart2 },
    { name: 'Plan Management', to: '/plan', icon: Sliders },
    { name: 'Automatic Refills', to: '/refills', icon: Repeat },
];

const userLinks: MenuItem[] = [
    { name: 'Profile', to: '/profile', icon: User },
    { name: 'Account', to: '/account', icon: Users },
    { name: 'Settings', to: '/settings', icon: Settings },
    { name: 'Credits History', to: '/credit-history', icon: FileText },
    { name: 'Notifications', to: '/notifications', icon: Bell },
];

const SIDEBAR_BG = 'bg-[#1a1730]';

export default function Sidebar({ isMobile = false, onClose }: SidebarProps) {
    const pathname = usePathname();

    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        Manage: true,
        User: true,
    });

    const toggleSection = (title: string) => {
        setExpandedSections(prev => ({
            ...prev,
            [title]: !prev[title],
        }));
    };

    const isActive = (path: string) => {
        if (path === '/dashboard' && pathname === '/dashboard') return true;
        if (path !== '/dashboard' && pathname.startsWith(path)) return true;
        return false;
    };

    const renderLink = (item: MenuItem) => {
        const Icon = item.icon;
        const active = isActive(item.to);
        return (
            <Link
                key={item.name + item.to}
                href={item.to}
                className={`flex items-center gap-3 w-full px-4 py-2 text-sm rounded-lg transition-all ${
                    active
                        ? 'bg-white/10 text-white font-medium'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
                onClick={isMobile ? onClose : undefined}
                aria-current={active ? 'page' : undefined}
            >
                <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-white' : ''}`} />
                <span>{item.name}</span>
            </Link>
        );
    };

    const renderCollapsibleSection = (title: string, links: MenuItem[]) => {
        const expanded = expandedSections[title] ?? true;
        return (
            <div key={title}>
                <button
                    onClick={() => toggleSection(title)}
                    className="flex items-center gap-1.5 w-full text-sm font-medium text-gray-400 mb-2 px-1 hover:text-white transition-colors"
                >
                    <span>{title}</span>
                    <motion.div
                        animate={{ rotate: expanded ? 0 : -90 }}
                        transition={{ duration: 0.2 }}
                    >
                        <ChevronDown className="w-3.5 h-3.5" />
                    </motion.div>
                </button>
                <AnimatePresence initial={false}>
                    {expanded && (
                        <motion.nav
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-0.5 overflow-hidden"
                            role="navigation"
                            aria-label={`${title} navigation`}
                        >
                            {links.map(renderLink)}
                        </motion.nav>
                    )}
                </AnimatePresence>
            </div>
        );
    };

    const sidebarContent = (
        <div className="flex flex-col h-full">
            {/* Scrollable nav area */}
            <div className="flex-1 overflow-y-auto space-y-6 pb-4">
                {/* Home - standalone top-level link */}
                <div>
                    <Link
                        href="/dashboard"
                        className={`flex items-center gap-3 w-full px-4 py-2 text-sm rounded-lg transition-all ${
                            pathname === '/dashboard'
                                ? 'bg-white/10 text-white font-medium'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                        onClick={isMobile ? onClose : undefined}
                        aria-current={pathname === '/dashboard' ? 'page' : undefined}
                    >
                        <Home className="w-4 h-4 shrink-0" />
                        <span>Home</span>
                    </Link>
                </div>

                {/* Build section - non-collapsible */}
                <div>
                    <div className="text-sm font-medium text-gray-400 mb-2 px-1">Build</div>
                    <nav className="space-y-0.5" role="navigation" aria-label="Build navigation">
                        {buildLinks.map(renderLink)}
                    </nav>
                </div>

                {/* Manage section - collapsible */}
                {renderCollapsibleSection('Manage', manageLinks)}

                {/* User section - collapsible */}
                {renderCollapsibleSection('User', userLinks)}
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-white/10 space-y-1">
                <Link
                    href="/feedback"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                    onClick={isMobile ? onClose : undefined}
                >
                    <MessageSquare className="w-4 h-4 shrink-0" />
                    <span>Feedback</span>
                </Link>
                <Link
                    href="/help"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                    onClick={isMobile ? onClose : undefined}
                >
                    <HelpCircle className="w-4 h-4 shrink-0" />
                    <span>Help & resources</span>
                </Link>
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
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className={`w-72 h-full ${SIDEBAR_BG} shadow-xl p-5 overflow-hidden relative z-50 border-r border-white/10`}
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <div className="bg-gradient-to-r from-primary to-accent w-8 h-8 rounded-full flex items-center justify-center">
                                <span className="text-white font-bold text-sm">A</span>
                            </div>
                            <Link href="/" className="text-lg font-bold hover:underline text-white">
                                AINative
                            </Link>
                        </div>
                        <button
                            onClick={onClose}
                            aria-label="Close Sidebar"
                            className="p-1.5 rounded-md hover:bg-white/10 transition-colors focus:outline-none focus:ring-1 focus:ring-primary"
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
        <aside className={`w-72 ${SIDEBAR_BG} border-r border-white/10 h-[calc(100vh-64px)] sticky top-[64px] hidden md:flex flex-col p-5 text-white`}>
            {sidebarContent}
        </aside>
    );
}
