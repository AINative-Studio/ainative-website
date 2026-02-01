'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { stripeConnectService } from '@/services/stripeConnectService';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

/**
 * Stripe Connect OAuth Callback Client Component
 * Handles OAuth callback flow with security validation
 */

type CallbackState = 'processing' | 'success' | 'error';

interface CallbackResult {
  state: CallbackState;
  message: string;
  redirectUrl?: string;
}

export default function StripeCallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [result, setResult] = useState<CallbackResult>({
    state: 'processing',
    message: 'Processing your Stripe connection...',
  });

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Extract URL parameters
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        // Handle OAuth errors from Stripe
        if (error) {
          const errorResult = stripeConnectService.handleOAuthError(
            error,
            errorDescription || undefined
          );

          setResult({
            state: 'error',
            message: errorResult.message,
          });

          // Clean up localStorage
          if (typeof window !== 'undefined') {
            localStorage.removeItem('stripe_oauth_state');
          }
          return;
        }

        // Validate required parameters
        if (!code || !state) {
          let errorMessage = 'Invalid callback request.';
          if (!code && !state) {
            errorMessage = 'Invalid callback request. Missing required parameters.';
          } else if (!code) {
            errorMessage = 'Missing authorization code. Please try again.';
          } else if (!state) {
            errorMessage = 'Missing state parameter. Please try again.';
          }

          setResult({
            state: 'error',
            message: errorMessage,
          });
          return;
        }

        // CSRF Protection: Validate state token
        let storedState: string | null = null;
        if (typeof window !== 'undefined') {
          storedState = localStorage.getItem('stripe_oauth_state');
        }

        const isValidState = stripeConnectService.validateStateToken(
          state,
          storedState || ''
        );

        if (!isValidState) {
          setResult({
            state: 'error',
            message:
              'Security validation failed. State mismatch detected. Please try connecting again.',
          });

          // Clean up localStorage
          if (typeof window !== 'undefined') {
            localStorage.removeItem('stripe_oauth_state');
          }
          return;
        }

        // Update status to show verification in progress
        setResult({
          state: 'processing',
          message: 'Verifying your Stripe account...',
        });

        // Complete OAuth flow
        const oauthResult = await stripeConnectService.completeOAuthFlow(
          code,
          state
        );

        // Clean up localStorage after completion
        if (typeof window !== 'undefined') {
          localStorage.removeItem('stripe_oauth_state');
        }

        if (!oauthResult.success) {
          setResult({
            state: 'error',
            message: oauthResult.message,
          });
          return;
        }

        // Success!
        setResult({
          state: 'success',
          message: oauthResult.message || 'Account linked successfully!',
          redirectUrl: oauthResult.redirect_url || '/developer/payouts',
        });

        // Redirect after showing success message
        setTimeout(() => {
          router.push(oauthResult.redirect_url || '/developer/payouts');
        }, 2000);
      } catch (error) {
        console.error('Unexpected error during OAuth callback:', error);

        setResult({
          state: 'error',
          message:
            'Failed to complete Stripe connection. Please try again or contact support.',
        });

        // Clean up localStorage on error
        if (typeof window !== 'undefined') {
          localStorage.removeItem('stripe_oauth_state');
        }
      }
    };

    handleCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-center">
            {result.state === 'processing' && 'Connecting Stripe'}
            {result.state === 'success' && 'Connection Successful'}
            {result.state === 'error' && 'Connection Failed'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {result.state === 'processing' && (
            <div className="text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
              <p className="text-sm text-gray-600">{result.message}</p>
              <p className="text-xs text-gray-500">
                Please wait while we verify your Stripe account...
              </p>
            </div>
          )}

          {result.state === 'success' && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Success!</AlertTitle>
              <AlertDescription className="text-green-700">
                {result.message}
                <br />
                <span className="text-xs">Redirecting you now...</span>
              </AlertDescription>
            </Alert>
          )}

          {result.state === 'error' && (
            <>
              <Alert className="border-red-200 bg-red-50">
                <XCircle className="h-4 w-4 text-red-600" />
                <AlertTitle className="text-red-800">Connection Failed</AlertTitle>
                <AlertDescription className="text-red-700">
                  {result.message}
                </AlertDescription>
              </Alert>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => router.push('/developer/payouts')}
                >
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
                <Link href="/developer/payouts" className="flex-1">
                  <Button variant="ghost" className="w-full">
                    Back to Dashboard
                  </Button>
                </Link>
              </div>

              <div className="text-xs text-gray-500 text-center">
                If you continue experiencing issues, please{' '}
                <Link href="/support" className="text-blue-600 hover:underline">
                  contact support
                </Link>
                .
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
