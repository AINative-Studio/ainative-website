'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Github, Mail, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // TODO: Implement actual authentication
      // For now, simulate a login
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Store auth state
      localStorage.setItem('authenticated', 'true');
      localStorage.setItem('user', JSON.stringify({ email }));

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGitHubLogin = () => {
    // TODO: Implement GitHub OAuth
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID}&scope=user:email`;
  };

  return (
    <div className="min-h-screen bg-[#0D1117] text-white flex items-center justify-center px-4 pt-16">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block text-3xl font-bold mb-4">
            <span className="text-[#FF6B00]">AI</span>
            <span className="text-primary">Native</span>
          </Link>
          <h1 className="text-2xl font-bold mb-2">Welcome back</h1>
          <p className="text-gray-400">Sign in to your account to continue</p>
        </div>

        {/* Login Form */}
        <div className="bg-[#161B22] rounded-2xl p-8 border border-[#2D333B]/50">
          {/* GitHub Login */}
          <Button
            type="button"
            variant="outline"
            className="w-full mb-6 h-12 bg-[#1C2128] border-[#2D333B] hover:bg-[#2D333B] hover:border-[#4B6FED]"
            onClick={handleGitHubLogin}
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-[#8AB4FF] hover:text-[#4B6FED] transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 bg-[#1C2128] border-[#2D333B] focus:border-[#4B6FED]"
              />
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
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center">
                  Sign in
                  <ArrowRight className="ml-2 h-4 w-4" />
                </span>
              )}
            </Button>
          </form>
        </div>

        {/* Sign up link */}
        <p className="text-center mt-6 text-gray-400">
          Don't have an account?{' '}
          <Link href="/signup" className="text-[#8AB4FF] hover:text-[#4B6FED] transition-colors font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
