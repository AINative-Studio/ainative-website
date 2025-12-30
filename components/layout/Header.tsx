'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { ButtonCustom } from '@/components/ui/button-custom';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation: { name: string; path: string; external?: boolean }[] = [
  { name: 'Products', path: '/products' },
  { name: 'Pricing', path: '/pricing' },
  { name: 'Docs', path: '/docs' },
  { name: 'ZeroDB', path: 'https://zerodb.ainative.studio', external: true },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session, status } = useSession();

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

  const isLoggedIn = status === 'authenticated';
  const isLoading = status === 'loading';
  const avatar = session?.user?.image;

  const handleLogout = () => {
    signOut({ callbackUrl: '/login' });
  };

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b',
        'bg-[#0D1117] shadow-sm border-[#2D333B]'
      )}
    >
      <div className="container-custom flex items-center justify-between py-4 px-4 md:px-6">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3">
            <img src="/ainative-icon.svg" alt="AINative Studio" className="h-12 w-auto" />
            <span className="text-2xl md:text-3xl font-bold tracking-tight uppercase flex items-center gap-1">
              <span className="text-white">AI</span><span className="text-[#5867EF]">NATIVE</span>
            </span>
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
                className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
              >
                {item.name}
              </a>
            ) : (
              <Link
                key={item.name}
                href={item.path}
                className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
              >
                {item.name}
              </Link>
            )
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          {isLoading ? (
            <div className="h-10 w-24 animate-pulse bg-[#2D333B] rounded" />
          ) : isDashboard ? (
            <>
              {avatar && (
                <img
                  src={avatar}
                  alt="avatar"
                  className="w-8 h-8 rounded-full border border-[#4B6FED]"
                />
              )}
              <ButtonCustom
                variant="outline"
                onClick={handleLogout}
              >
                Logout
              </ButtonCustom>
            </>
          ) : ['/login', '/signup'].includes(pathname) ? (
            <Link href="/">
              <ButtonCustom variant="primary">Back to Home</ButtonCustom>
            </Link>
          ) : isLoggedIn ? (
            <>
              <Link href="/dashboard">
                <ButtonCustom variant="outline">Dashboard</ButtonCustom>
              </Link>
              <ButtonCustom
                variant="ghost"
                onClick={handleLogout}
              >
                Sign Out
              </ButtonCustom>
              <a
                href="https://calendly.com/seedlingstudio/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ButtonCustom variant="primary">Book a Call</ButtonCustom>
              </a>
            </>
          ) : (
            <>
              <Link href="/login">
                <ButtonCustom variant="outline">Sign In</ButtonCustom>
              </Link>
              <a
                href="https://calendly.com/seedlingstudio/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ButtonCustom variant="primary">Book a Call</ButtonCustom>
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
        <div className="fixed inset-0 z-40 bg-[#0D1117] animate-in slide-in-from-top p-6 flex flex-col gap-6 md:hidden">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-3" onClick={() => setMobileMenuOpen(false)}>
              <img src="/ainative-icon.svg" alt="AINative Studio" className="h-10 w-auto" />
              <span className="text-xl font-bold tracking-tight uppercase flex items-center gap-1">
                <span className="text-white">AI</span><span className="text-[#5867EF]">NATIVE</span>
              </span>
            </Link>
            <button
              className="text-gray-400 hover:text-white"
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
                  className="text-base font-medium text-gray-400 hover:text-white transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </a>
              ) : (
                <Link
                  key={item.name}
                  href={item.path}
                  className="text-base font-medium text-gray-400 hover:text-white transition-colors"
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
                <ButtonCustom
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                >
                  Logout
                </ButtonCustom>
              </>
            ) : isLoggedIn ? (
              <>
                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  <ButtonCustom variant="outline" className="w-full">
                    Dashboard
                  </ButtonCustom>
                </Link>
                <ButtonCustom
                  variant="ghost"
                  className="w-full"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                >
                  Sign Out
                </ButtonCustom>
                <a
                  href="https://calendly.com/seedlingstudio/"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <ButtonCustom variant="primary" className="w-full">
                    Book a Call
                  </ButtonCustom>
                </a>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <ButtonCustom variant="outline" className="w-full">
                    Sign In
                  </ButtonCustom>
                </Link>
                <a
                  href="https://calendly.com/seedlingstudio/"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <ButtonCustom variant="primary" className="w-full">
                    Book a Call
                  </ButtonCustom>
                </a>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
