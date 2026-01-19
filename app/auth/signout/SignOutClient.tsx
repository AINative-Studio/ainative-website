'use client';

import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LogOut, Loader2 } from 'lucide-react';
import { syncLogoutAcrossSubdomains } from '@/lib/session-sync';

export default function SignOutClient() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);

    try {
      // Sync logout across all subdomains
      await syncLogoutAcrossSubdomains();

      // Sign out from NextAuth
      await signOut({
        callbackUrl: '/',
        redirect: true,
      });
    } catch (error) {
      console.error('Sign out error:', error);
      setIsSigningOut(false);
    }
  };

  const handleCancel = () => {
    router.push('/dashboard');
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-vite-bg">
        <div className="animate-pulse">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-vite-bg px-4">
        <Card className="w-full max-w-md p-8 space-y-6 bg-[#161B22] border-gray-800 text-center">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-white">Already Signed Out</h1>
            <p className="text-gray-400">You are not currently signed in.</p>
          </div>

          <Button
            onClick={() => router.push('/')}
            className="w-full bg-primary hover:bg-primary/90 text-white"
            size="lg"
          >
            Go to Home
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-vite-bg px-4">
      <Card className="w-full max-w-md p-8 space-y-6 bg-[#161B22] border-gray-800">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center">
            <LogOut className="h-6 w-6 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Sign Out</h1>
          <p className="text-gray-400">
            Are you sure you want to sign out?
          </p>
        </div>

        {/* Session Info */}
        {session?.user && (
          <div className="p-4 bg-vite-bg border border-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              {session.user.image && (
                <img
                  src={session.user.image}
                  alt={session.user.name || 'User'}
                  className="w-10 h-10 rounded-full"
                />
              )}
              <div>
                <p className="text-sm font-medium text-white">
                  {session.user.name || 'User'}
                </p>
                <p className="text-xs text-gray-400">
                  {session.user.email}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Warning */}
        <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <p className="text-sm text-yellow-400">
            You will be signed out from all *.ainative.studio subdomains including:
          </p>
          <ul className="mt-2 text-xs text-yellow-400/80 space-y-1">
            <li>• www.ainative.studio</li>
            <li>• app.ainative.studio</li>
            <li>• api.ainative.studio</li>
            <li>• qnn.ainative.studio</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="w-full bg-red-600 hover:bg-red-700 text-white"
            size="lg"
          >
            {isSigningOut ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Signing out...
              </>
            ) : (
              <>
                <LogOut className="mr-2 h-5 w-5" />
                Yes, Sign Out
              </>
            )}
          </Button>

          <Button
            onClick={handleCancel}
            disabled={isSigningOut}
            variant="outline"
            className="w-full border-gray-700 text-white hover:bg-gray-800"
            size="lg"
          >
            Cancel
          </Button>
        </div>
      </Card>
    </div>
  );
}
