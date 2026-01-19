'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Github, ArrowRight, Check } from 'lucide-react';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // TODO: Implement actual user registration API call
      // For now, sign in with credentials after "registration"
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl: '/dashboard',
      });

      if (result?.error) {
        setError('Failed to create account. Please try again.');
      } else if (result?.url) {
        window.location.href = result.url;
      }
    } catch {
      setError('Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGitHubSignup = () => {
    signIn('github', { callbackUrl: '/dashboard' });
  };

  const benefits = [
    'Free API credits to get started',
    'Access to ZeroDB vector database',
    'AI-powered code completion',
    'Community support & tutorials',
  ];

  return (
    <div className="min-h-screen bg-vite-bg text-white flex items-center justify-center px-4 pt-16">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center gap-3 mb-6">
            <img src="/ainative-icon.svg" alt="AINative Studio" className="h-12 w-auto" />
            <span className="text-2xl font-bold uppercase">
              <span className="text-white">AI</span><span className="text-[#5867EF]">NATIVE</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold mb-2 text-white">Create your account</h1>
          <p className="text-gray-400">Start building AI-native applications today</p>
        </div>

        {/* Signup Form */}
        <div className="bg-[#161B22] rounded-2xl p-8 border border-[#2D333B]/50">
          {/* GitHub Signup */}
          <Button
            type="button"
            variant="outline"
            className="w-full mb-6 h-12 bg-[#1C2128] border-[#2D333B] hover:bg-[#2D333B] hover:border-[#4B6FED]"
            onClick={handleGitHubSignup}
          >
            <Github className="mr-2 h-5 w-5" />
            Continue with GitHub
          </Button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#2D333B]" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-[#161B22] px-2 text-gray-400">or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-12 bg-[#1C2128] border-[#2D333B] focus:border-[#4B6FED]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 bg-[#1C2128] border-[#2D333B] focus:border-[#4B6FED]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="h-12 bg-[#1C2128] border-[#2D333B] focus:border-[#4B6FED]"
              />
              <p className="text-xs text-gray-500">Must be at least 8 characters</p>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-[#4B6FED] to-[#8A63F4] hover:from-[#3A56D3] hover:to-[#7A4FEB]"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </span>
              ) : (
                <span className="flex items-center">
                  Create account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </span>
              )}
            </Button>
          </form>

          {/* Benefits */}
          <div className="mt-6 pt-6 border-t border-[#2D333B]">
            <p className="text-sm text-gray-400 mb-3">What you&apos;ll get:</p>
            <ul className="space-y-2">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-center text-sm text-gray-300">
                  <Check className="mr-2 h-4 w-4 text-[#4B6FED]" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Terms */}
        <p className="text-center mt-6 text-sm text-gray-500">
          By signing up, you agree to our{' '}
          <Link href="/terms" className="text-[#8AB4FF] hover:underline">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-[#8AB4FF] hover:underline">
            Privacy Policy
          </Link>
        </p>

        {/* Login link */}
        <p className="text-center mt-4 text-gray-400">
          Already have an account?{' '}
          <Link href="/login" className="text-[#8AB4FF] hover:text-[#4B6FED] transition-colors font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
