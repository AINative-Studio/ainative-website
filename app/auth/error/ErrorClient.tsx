'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertCircle, Home, RefreshCw } from 'lucide-react';

export default function ErrorClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const error = searchParams?.get('error');

  const errorMessages: Record<string, { title: string; description: string; }> = {
    Configuration: {
      title: 'Server Configuration Error',
      description: 'There is a problem with the server configuration. Please contact support.',
    },
    AccessDenied: {
      title: 'Access Denied',
      description: 'You do not have permission to sign in. Please contact support if you believe this is an error.',
    },
    Verification: {
      title: 'Verification Failed',
      description: 'The sign in link is no longer valid. It may have expired or already been used.',
    },
    OAuthSignin: {
      title: 'OAuth Sign In Error',
      description: 'An error occurred while starting the OAuth sign in process. Please try again.',
    },
    OAuthCallback: {
      title: 'OAuth Callback Error',
      description: 'An error occurred during the OAuth callback. Please try signing in again.',
    },
    OAuthCreateAccount: {
      title: 'Account Creation Error',
      description: 'Could not create your account using OAuth. Please try a different sign in method.',
    },
    EmailCreateAccount: {
      title: 'Email Account Error',
      description: 'Could not create your account. Please try again or use a different sign in method.',
    },
    Callback: {
      title: 'Callback Error',
      description: 'An error occurred during the authentication callback. Please try again.',
    },
    OAuthAccountNotLinked: {
      title: 'Account Already Linked',
      description: 'This email is already associated with another account. Please sign in with your original provider.',
    },
    EmailSignin: {
      title: 'Email Sign In',
      description: 'Check your email for the sign in link.',
    },
    CredentialsSignin: {
      title: 'Invalid Credentials',
      description: 'The email or password you entered is incorrect. Please try again.',
    },
    SessionRequired: {
      title: 'Session Required',
      description: 'You must be signed in to access this page. Please sign in and try again.',
    },
    RefreshAccessTokenError: {
      title: 'Token Refresh Error',
      description: 'Your session could not be refreshed. Please sign in again.',
    },
    Default: {
      title: 'Authentication Error',
      description: 'An unexpected error occurred during authentication. Please try again.',
    },
  };

  const errorInfo = error && errorMessages[error]
    ? errorMessages[error]
    : errorMessages.Default;

  const handleRetry = () => {
    router.push('/auth/signin');
  };

  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-vite-bg px-4">
      <Card className="w-full max-w-md p-8 space-y-6 bg-[#161B22] border-gray-800">
        {/* Icon */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center">
            <AlertCircle className="h-6 w-6 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">{errorInfo.title}</h1>
          <p className="text-gray-400">{errorInfo.description}</p>
        </div>

        {/* Error Code */}
        {error && (
          <div className="p-4 bg-vite-bg border border-gray-700 rounded-lg">
            <p className="text-sm text-gray-400">
              Error Code: <span className="text-red-400 font-mono">{error}</span>
            </p>
          </div>
        )}

        {/* Troubleshooting Tips */}
        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <h3 className="text-sm font-semibold text-blue-400 mb-2">
            Troubleshooting Tips:
          </h3>
          <ul className="text-xs text-blue-400/80 space-y-1">
            <li>• Clear your browser cookies and cache</li>
            <li>• Try signing in with a different provider</li>
            <li>• Ensure your browser allows cookies from *.ainative.studio</li>
            <li>• Check that your browser supports HTTPS</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            onClick={handleRetry}
            className="w-full bg-primary hover:bg-primary/90 text-white"
            size="lg"
          >
            <RefreshCw className="mr-2 h-5 w-5" />
            Try Again
          </Button>

          <Button
            onClick={handleGoHome}
            variant="outline"
            className="w-full border-gray-700 text-white hover:bg-gray-800"
            size="lg"
          >
            <Home className="mr-2 h-5 w-5" />
            Go to Home
          </Button>
        </div>

        {/* Support Link */}
        <div className="text-center text-sm text-gray-400">
          <p>
            Still having trouble?{' '}
            <a
              href="mailto:support@ainative.studio"
              className="text-primary hover:underline"
            >
              Contact Support
            </a>
          </p>
        </div>
      </Card>
    </div>
  );
}
