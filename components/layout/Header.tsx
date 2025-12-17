'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Products', path: '/products' },
  { name: 'Pricing', path: '/pricing' },
  { name: 'Design System', path: '/design-system' },
  { name: 'ZeroDB', path: 'https://zerodb.ainative.studio', external: true },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);

  const pathname = usePathname();
  const isDashboard = pathname.startsWith('/dashboard') ||
    pathname.startsWith('/account') ||
    pathname.startsWith('/plan') ||
    pathname.startsWith('/billing') ||
    pathname.startsWith('/purchase-credits') ||
    pathname.startsWith('/profile') ||
    pathname.startsWith('/settings') ||
    pathname.startsWith('/notifications') ||
    pathname.startsWith('/credit-history') ||
    pathname.startsWith('/refills') ||
    pathname.startsWith('/developer-settings');

  useEffect(() => {
    const checkLoginStatus = () => {
      const userData = localStorage.getItem('user');
      const authenticated = localStorage.getItem('authenticated');
      const accessToken = localStorage.getItem('access_token');
      const githubToken = localStorage.getItem('github_token');
      const githubCode = localStorage.getItem('github_code');

      const hasAuthToken = !!(authenticated || accessToken || githubToken || githubCode);
      const isOnDashboardPage = pathname.startsWith('/dashboard') ||
        pathname.startsWith('/account') ||
        pathname.startsWith('/plan') ||
        pathname.startsWith('/billing') ||
        pathname.startsWith('/purchase-credits') ||
        pathname.startsWith('/profile') ||
        pathname.startsWith('/settings') ||
        pathname.startsWith('/notifications') ||
        pathname.startsWith('/credit-history') ||
        pathname.startsWith('/refills') ||
        pathname.startsWith('/developer-settings');

      setIsLoggedIn(hasAuthToken || isOnDashboardPage);

      if (userData) {
        try {
          const user = JSON.parse(userData);
          setAvatar(user.avatar_url);
        } catch {
          // If userData is not valid JSON, ignore
        }
      }
    };

    checkLoginStatus();
    window.addEventListener('storage', checkLoginStatus);
    return () => window.removeEventListener('storage', checkLoginStatus);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b',
        'bg-background dark:bg-background shadow-sm border-border',
        'bg-opacity-100 dark:bg-opacity-100'
      )}
    >
      <div className="container flex items-center justify-between py-4 px-4 md:px-6 mx-auto max-w-7xl">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <Link href="/" className="text-xl md:text-2xl font-bold tracking-tight text-foreground flex items-center gap-1">
            <span className="text-[#FF6B00]">AI</span>
            <span className="text-primary">Native</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navigation.map((item) => (
            item.external ? (
              <a
                key={item.name}
                href={item.path}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.name}
              </a>
            ) : (
              <Link
                key={item.name}
                href={item.path}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.name}
              </Link>
            )
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          {isDashboard ? (
            <>
              {avatar && (
                <img
                  src={avatar}
                  alt="avatar"
                  className="w-8 h-8 rounded-full border border-[#4B6FED]"
                />
              )}
              <Button
                variant="outline"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </>
          ) : ['/login', '/signup'].includes(pathname) ? (
            <Link href="/">
              <Button>Back to Home</Button>
            </Link>
          ) : isLoggedIn ? (
            <>
              <Link href="/dashboard">
                <Button variant="outline">Dashboard</Button>
              </Link>
              <Button
                variant="ghost"
                onClick={handleLogout}
              >
                Sign Out
              </Button>
              <a
                href="https://calendly.com/seedlingstudio/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button>Book a Call</Button>
              </a>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="outline">Sign In</Button>
              </Link>
              <a
                href="https://calendly.com/seedlingstudio/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button>Book a Call</Button>
              </a>
            </>
          )}
        </div>

        {/* Mobile Actions (Right side menu toggle) */}
        <div className="md:hidden flex items-center gap-2">
          <button
            className="text-muted-foreground hover:text-foreground transition"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Sheet */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-background animate-in slide-in-from-top p-6 flex flex-col gap-6 md:hidden">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-xl font-bold tracking-tight text-foreground" onClick={() => setMobileMenuOpen(false)}>
              <span className="text-[#FF6B00]">AI</span>
              <span className="text-primary">Native</span>
            </Link>
            <button
              className="text-muted-foreground hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close mobile menu"
            >
              <X size={24} />
            </button>
          </div>

          <nav className="flex flex-col gap-4 mt-8">
            {navigation.map((item) => (
              item.external ? (
                <a
                  key={item.name}
                  href={item.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base font-medium text-muted-foreground hover:text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </a>
              ) : (
                <Link
                  key={item.name}
                  href={item.path}
                  className="text-base font-medium text-muted-foreground hover:text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              )
            ))}
          </nav>

          <div className="mt-8 flex flex-col gap-3">
            {isDashboard ? (
              <>
                {avatar && (
                  <img
                    src={avatar}
                    alt="avatar"
                    className="w-8 h-8 rounded-full border border-[#4B6FED] mx-auto mb-2"
                  />
                )}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    localStorage.clear();
                    setMobileMenuOpen(false);
                    window.location.href = '/login';
                  }}
                >
                  Logout
                </Button>
              </>
            ) : isLoggedIn ? (
              <>
                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Dashboard
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => {
                    localStorage.clear();
                    setMobileMenuOpen(false);
                    window.location.href = '/login';
                  }}
                >
                  Sign Out
                </Button>
                <a
                  href="https://calendly.com/seedlingstudio/"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button className="w-full">
                    Book a Call
                  </Button>
                </a>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <a
                  href="https://calendly.com/seedlingstudio/"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button className="w-full">
                    Book a Call
                  </Button>
                </a>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
