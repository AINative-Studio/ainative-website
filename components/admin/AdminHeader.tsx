'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import {
  Search,
  Bell,
  ChevronRight,
  User,
  Settings,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

interface AdminHeaderProps {
  notificationCount?: number;
}

interface UserData {
  email?: string;
  name?: string;
  role?: string;
  avatar?: string;
}

export default function AdminHeader({ notificationCount = 0 }: AdminHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<UserData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const loadUserData = useCallback(() => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        setUser(JSON.parse(userStr));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }, []);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  const handleLogout = () => {
    try {
      localStorage.removeItem('user');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      router.push('/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const handleProfile = () => {
    router.push('/dashboard/settings');
  };

  const handleSettings = () => {
    router.push('/dashboard/settings');
  };

  // Generate breadcrumbs from pathname
  const breadcrumbs = pathname
    ?.split('/')
    .filter(Boolean)
    .map(segment => {
      // Convert kebab-case and snake_case to Title Case
      return segment
        .split(/[-_]/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    });

  const displayName = user?.name || user?.email || 'User';
  const displayEmail = user?.email || '';

  return (
    <header
      role="banner"
      className="sticky top-0 z-30 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800"
    >
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left: Breadcrumbs */}
        <div className="flex items-center gap-2">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-2 text-sm">
              {breadcrumbs?.map((crumb, index) => (
                <li key={index} className="flex items-center gap-2">
                  {index > 0 && (
                    <ChevronRight className="h-4 w-4 text-gray-500" />
                  )}
                  <span
                    className={cn(
                      'font-medium',
                      index === breadcrumbs.length - 1
                        ? 'text-white'
                        : 'text-gray-400'
                    )}
                  >
                    {crumb}
                  </span>
                </li>
              ))}
            </ol>
          </nav>
        </div>

        {/* Right: Search, Notifications, User Menu */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64 bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 focus:border-blue-500"
              aria-label="Search"
            />
          </div>

          {/* Notifications */}
          <button
            type="button"
            className="relative p-2 rounded-lg hover:bg-gray-800 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5 text-gray-400" />
            {notificationCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center p-0 text-xs"
              >
                {notificationCount}
              </Badge>
            )}
          </button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                aria-label="User menu"
              >
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-white">{displayName}</p>
                    {displayEmail && (
                      <p className="text-xs text-gray-400">{displayEmail}</p>
                    )}
                  </div>
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={displayName}
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-5 w-5 text-white" />
                    )}
                  </div>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-gray-800 border-gray-700">
              <DropdownMenuLabel className="text-gray-300">
                My Account
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-700" />
              <DropdownMenuItem
                onClick={handleProfile}
                className="text-gray-300 focus:bg-gray-700 focus:text-white cursor-pointer"
              >
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleSettings}
                className="text-gray-300 focus:bg-gray-700 focus:text-white cursor-pointer"
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-700" />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-red-400 focus:bg-red-900/20 focus:text-red-400 cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
