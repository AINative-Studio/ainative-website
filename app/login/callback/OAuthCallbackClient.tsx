'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { authService } from '@/services/AuthService';
import { setAuthUser } from '@/utils/authCookies';

// Real GitHub OAuth implementation integrated with AINative API
// Exchanges authorization code for JWT tokens via our backend
// Supports cross-subdomain SSO with state-based redirect

export default function OAuthCallbackClient() {
  const [status, setStatus] = useState('Processing login...');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        setStatus('Processing GitHub authorization...');

        // Get code and state from URL
        const code = searchParams.get('code');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');
        const state = searchParams.get('state');

        // Get stored callback URL from login page
        const storedCallbackUrl = typeof window !== 'undefined'
          ? localStorage.getItem('oauth_callback_url') || '/dashboard'
          : '/dashboard';

        // Handle errors from GitHub
        if (error) {
          console.error('GitHub OAuth error:', error, errorDescription);
          toast.error(`GitHub OAuth error: ${errorDescription || error}`);
          router.push('/login?error=' + encodeURIComponent(error));
          return;
        }

        // Make sure we have a code
        if (!code) {
          console.error('No authorization code received from GitHub');
          toast.error('No authorization code received from GitHub');
          router.push('/login?error=no_code');
          return;
        }

        console.log('GitHub authorization code received, exchanging for tokens...');
        setStatus('Exchanging code for access token...');

        // Exchange authorization code for JWT tokens via our backend
        try {
          const response = await authService.handleOAuthCallback(code, state || undefined);

          if (response.access_token) {
            setStatus('Authentication successful! Loading profile...');

            // Get user profile to verify authentication
            const userProfile = await authService.getCurrentUser();
            console.log('User profile loaded:', userProfile);

            // Store user in cookies for SSO
            if (userProfile) {
              setAuthUser(userProfile as unknown as Record<string, unknown>);
            }

            // Check if this is a new user (first login)
            // If welcome_dismissed is not set, this is likely a first-time user
            const isFirstLogin = typeof window !== 'undefined'
              && !localStorage.getItem('welcome_dismissed');

            setStatus('Login successful! Redirecting...');
            toast.success('Successfully authenticated with GitHub!');

            // Clear stored callback URL
            if (typeof window !== 'undefined') {
              localStorage.removeItem('oauth_callback_url');
            }

            // Redirect to stored callback URL or dashboard with welcome flag for new users
            const redirectUrl = isFirstLogin && storedCallbackUrl === '/dashboard'
              ? '/dashboard?welcome=true'
              : storedCallbackUrl;

            setTimeout(() => {
              router.push(redirectUrl);
            }, 1000);

          } else {
            throw new Error('No access token received from server');
          }

        } catch (authError: unknown) {
          console.error('GitHub OAuth exchange failed:', authError);

          const errorMessage = authError instanceof Error
            ? authError.message
            : 'GitHub authentication failed';

          toast.error(errorMessage);
          setStatus(`GitHub OAuth failed: ${errorMessage}`);

          setTimeout(() => {
            router.push('/login?error=' + encodeURIComponent(errorMessage));
          }, 2000);
        }

      } catch (err: unknown) {
        console.error('OAuth callback error:', err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        toast.error('Authentication failed: ' + errorMessage);
        router.push('/login?error=' + encodeURIComponent(errorMessage));
      }
    };

    handleOAuthCallback();
  }, [router, searchParams]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-vite-bg text-white p-4">
      <div className="flex flex-col items-center space-y-6 max-w-md text-center">
        <div className="flex items-center space-x-3">
          <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12C24 5.37 18.63 0 12 0z"/>
          </svg>
          <Loader2 className="h-8 w-8 animate-spin text-[#4B6FED]" />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-semibold">GitHub Authentication</h1>
          <p className="text-gray-400">{status}</p>
        </div>
        <div className="text-xs text-gray-500 space-y-1">
          <p>Securely connecting your GitHub account</p>
          <p>with AINative authentication system</p>
        </div>
      </div>
    </div>
  );
}
