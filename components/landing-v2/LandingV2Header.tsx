'use client';

import Link from 'next/link';
import AINativeLogo from './AINativeLogo';

const NAV_LINKS = [
  { label: 'Products', href: '/products' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Design System', href: '/design-system' },
  { label: 'ZeroDB', href: 'https://zerodb.ainative.studio', external: true },
];

export default function LandingV2Header() {
  return (
    <header className="relative z-50 max-w-[1440px] mx-auto px-[122px] pt-[46px] flex items-center justify-between">
      <Link href="/" className="flex items-center">
        <AINativeLogo className="h-[44px] w-auto align-middle" />
      </Link>

      <nav className="flex items-center gap-8">
        {NAV_LINKS.map((link) =>
          link.external ? (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-sm text-v2-nav-gray hover:text-white transition-colors"
            >
              {link.label}
            </a>
          ) : (
            <Link
              key={link.label}
              href={link.href}
              className="font-medium text-sm text-v2-nav-gray hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          )
        )}
      </nav>

      <div className="flex items-center gap-[34px]">
        <Link
          href="/login"
          className="font-medium text-sm text-white leading-[37px] hover:text-v2-highlight transition-colors"
        >
          Sign In
        </Link>
        <a
          href="https://calendly.com/ainative"
          target="_blank"
          rel="noopener noreferrer"
          className="w-[106px] h-[37px] bg-brand-primary rounded-lg text-white font-bold text-sm flex items-center justify-center transition-all hover:bg-v2-btn-hover hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(88,103,239,0.4)]"
        >
          Book a Call
        </a>
      </div>
    </header>
  );
}
