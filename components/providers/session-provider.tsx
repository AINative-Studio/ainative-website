'use client';

import { useEffect } from 'react';
import { SessionProvider as NextAuthSessionProvider, useSession } from 'next-auth/react';

/**
 * Token Sync Component
 * Syncs the NextAuth session access token to localStorage
 * so the api-client can use it for authenticated API calls
 */
function TokenSync({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'authenticated' && session?.accessToken) {
      // Sync access token to localStorage for api-client
      localStorage.setItem('accessToken', session.accessToken as string);
    } else if (status === 'unauthenticated') {
      // Clear token on logout
      localStorage.removeItem('accessToken');
    }
  }, [session, status]);

  return <>{children}</>;
}

export default function SessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NextAuthSessionProvider>
      <TokenSync>{children}</TokenSync>
    </NextAuthSessionProvider>
  );
}
