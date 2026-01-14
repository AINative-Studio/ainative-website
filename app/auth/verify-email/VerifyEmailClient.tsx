'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { authService } from '@/services/AuthService';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function VerifyEmailClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');

      if (!token) {
        setStatus('error');
        setMessage('No verification token provided. Please check your email and click the verification link.');
        return;
      }

      try {
        // Call backend verification endpoint
        const response = await authService.verifyEmail(token);

        setStatus('success');
        setMessage(response.message || 'Email verified successfully! You can now log in.');

        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login?emailVerified=true');
        }, 3000);
      } catch (error: unknown) {
        setStatus('error');
        if (error instanceof Error) {
          setMessage(
            error.message || 'Failed to verify email. The link may be expired or invalid.'
          );
        } else {
          setMessage('Failed to verify email. The link may be expired or invalid.');
        }
      }
    };

    verifyEmail();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0D1117] px-4">
      <div className="max-w-md w-full bg-[#161B22] rounded-2xl border border-[#2D333B]/50 p-8 text-center">
        {status === 'loading' && (
          <>
            <div className="flex justify-center mb-6">
              <Loader2 className="h-16 w-16 text-[#4B6FED] animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">
              Verifying Your Email
            </h1>
            <p className="text-gray-400">
              Please wait while we verify your email address...
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="flex justify-center mb-6">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">
              Email Verified!
            </h1>
            <p className="text-gray-400 mb-6">
              {message}
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Redirecting to login in 3 seconds...
            </p>
            <Link href="/login">
              <Button className="bg-gradient-to-r from-[#4B6FED] to-[#8A63F4] hover:from-[#3A56D3] hover:to-[#7A4FEB]">
                Go to Login Now
              </Button>
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="flex justify-center mb-6">
              <XCircle className="h-16 w-16 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">
              Verification Failed
            </h1>
            <p className="text-gray-400 mb-6">
              {message}
            </p>
            <div className="flex flex-col gap-3">
              <Link href="/signup">
                <Button
                  variant="outline"
                  className="w-full bg-[#1C2128] border-[#2D333B] hover:bg-[#2D333B] hover:border-[#4B6FED]"
                >
                  Create New Account
                </Button>
              </Link>
              <Link href="/login">
                <Button className="w-full bg-gradient-to-r from-[#4B6FED] to-[#8A63F4] hover:from-[#3A56D3] hover:to-[#7A4FEB]">
                  Go to Login
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
