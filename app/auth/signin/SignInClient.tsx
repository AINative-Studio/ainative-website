'use client';

import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Github, Linkedin } from 'lucide-react';

export default function SignInClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const callbackUrl = searchParams?.get('callbackUrl') || '/dashboard';
  const errorParam = searchParams?.get('error');

  useEffect(() => {
    // If already authenticated, redirect to callback URL
    if (status === 'authenticated' && session) {
      router.push(callbackUrl);
    }
  }, [status, session, callbackUrl, router]);

  useEffect(() => {
    // Handle error from URL parameters
    if (errorParam) {
      const errorMessages: Record<string, string> = {
        Configuration: 'There is a problem with the server configuration.',
        AccessDenied: 'Access denied. Please try again.',
        Verification: 'The sign in link is no longer valid.',
        OAuthSignin: 'Error starting OAuth sign in.',
        OAuthCallback: 'Error during OAuth callback.',
        OAuthCreateAccount: 'Could not create OAuth account.',
        EmailCreateAccount: 'Could not create email account.',
        Callback: 'Error during callback.',
        OAuthAccountNotLinked:
          'This account is already linked to another provider.',
        EmailSignin: 'Check your email for the sign in link.',
        CredentialsSignin: 'Invalid credentials. Please try again.',
        SessionRequired: 'Please sign in to access this page.',
        Default: 'An error occurred. Please try again.',
      };

      setError(errorMessages[errorParam] || errorMessages.Default);
    }
  }, [errorParam]);

  const handleGitHubSignIn = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn('github', {
        callbackUrl,
        redirect: true,
      });

      if (result?.error) {
        setError('Failed to sign in with GitHub. Please try again.');
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Sign in error:', err);
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  const handleLinkedInSignIn = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn('linkedin', {
        callbackUrl,
        redirect: true,
      });

      if (result?.error) {
        setError('Failed to sign in with LinkedIn. Please try again.');
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Sign in error:', err);
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  const handleCredentialsSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const result = await signIn('credentials', {
        email,
        password,
        callbackUrl,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password. Please try again.');
        setIsLoading(false);
      } else if (result?.ok) {
        router.push(callbackUrl);
      }
    } catch (err) {
      console.error('Sign in error:', err);
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-vite-bg px-4">
      <Card className="w-full max-w-md p-8 space-y-6 bg-[#161B22] border-gray-800">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
          <p className="text-gray-400">
            Sign in to access your AI Native Studio dashboard
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* OAuth Sign In */}
        <div className="space-y-3">
          <Button
            onClick={handleGitHubSignIn}
            disabled={isLoading}
            className="w-full bg-[#24292E] hover:bg-[#2F363D] text-white"
            size="lg"
          >
            {isLoading ? (
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Github className="mr-2 h-5 w-5" />
                Continue with GitHub
              </>
            )}
          </Button>
          <Button
            onClick={handleLinkedInSignIn}
            disabled={isLoading}
            className="w-full bg-[#0A66C2] hover:bg-[#004182] text-white"
            size="lg"
          >
            {isLoading ? (
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Linkedin className="mr-2 h-5 w-5" />
                Continue with LinkedIn
              </>
            )}
          </Button>
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-700" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-[#161B22] text-gray-400">Or continue with email</span>
          </div>
        </div>

        {/* Email/Password Sign In */}
        <form onSubmit={handleCredentialsSignIn} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              disabled={isLoading}
              className="w-full px-4 py-2 bg-vite-bg border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              disabled={isLoading}
              className="w-full px-4 py-2 bg-vite-bg border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50"
              placeholder="••••••••"
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/90 text-white"
            size="lg"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        {/* Footer */}
        <div className="text-center text-sm text-gray-400">
          <p>
            Don&apos;t have an account?{' '}
            <a href="/signup" className="text-primary hover:underline">
              Sign up
            </a>
          </p>
        </div>

        {/* Cross-subdomain notice */}
        <div className="text-xs text-center text-gray-500">
          By signing in, you agree to stay signed in across all *.ainative.studio subdomains
        </div>
      </Card>
    </div>
  );
}
