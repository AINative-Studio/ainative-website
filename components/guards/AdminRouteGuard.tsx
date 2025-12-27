'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield } from 'lucide-react';

interface UserData {
  role?: string;
  roles?: string[];
  is_superuser?: boolean;
}

interface AdminRouteGuardProps {
  children: React.ReactNode;
}

/**
 * AdminRouteGuard - Protects routes that should only be accessible to admin users
 *
 * Checks if the current user has admin role (ADMIN or SUPERUSER)
 * Redirects non-admin users to dashboard with an error message
 */
export function AdminRouteGuard({ children }: AdminRouteGuardProps) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAdminStatus();
    // checkAdminStatus is intentionally not included in deps - only runs on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAdminStatus = () => {
    try {
      const userStr = localStorage.getItem('user');

      if (!userStr) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      const user: UserData = JSON.parse(userStr);

      // Check if user has admin role
      // Roles can be in different formats depending on API response:
      // - user.role (single role string)
      // - user.roles (array of role strings)
      const userRole = user.role || (user.roles && user.roles[0]);
      const isUserAdmin = userRole === 'ADMIN' || userRole === 'SUPERUSER' || user.is_superuser === true;

      setIsAdmin(isUserAdmin);
      setLoading(false);
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    // Redirect to dashboard after showing error
    setTimeout(() => {
      router.push('/dashboard');
    }, 2000);

    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Alert variant="destructive" className="border-red-800 bg-red-900/20">
          <Shield className="h-5 w-5 text-red-400" />
          <AlertDescription className="text-red-300 ml-2">
            <strong>Access Denied:</strong> This page is restricted to administrators only.
            You will be redirected to the dashboard.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
}

/**
 * Hook to check if current user is admin
 * Can be used in any component to conditionally render admin-only features
 */
export function useIsAdmin(): boolean {
  const [isAdmin] = useState(() => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        return false;
      }

      const user: UserData = JSON.parse(userStr);
      const userRole = user.role || (user.roles && user.roles[0]);
      return userRole === 'ADMIN' || userRole === 'SUPERUSER' || user.is_superuser === true;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  });

  return isAdmin;
}
