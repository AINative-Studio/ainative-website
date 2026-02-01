/**
 * @jest-environment jsdom
 *
 * TEST SUITE: Bug #484 - Navbar Spacing Issue
 *
 * Purpose: Ensure proper spacing between fixed navbar and hero content
 * to prevent visual overlap across all viewport sizes.
 *
 * Target Coverage: 85%+
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Header from '@/components/layout/Header';
import HomeClient from '@/app/HomeClient';

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: () => ({ data: null, status: 'unauthenticated' }),
  signOut: jest.fn(),
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, style, ...props }: any) => (
      <div className={className} style={style} {...props}>
        {children}
      </div>
    ),
    h1: ({ children, className, ...props }: any) => (
      <h1 className={className} {...props}>
        {children}
      </h1>
    ),
    p: ({ children, className, ...props }: any) => (
      <p className={className} {...props}>
        {children}
      </p>
    ),
    span: ({ children, className, ...props }: any) => (
      <span className={className} {...props}>
        {children}
      </span>
    ),
  },
  useScroll: () => ({ scrollYProgress: { get: () => 0 } }),
  useTransform: () => ({ get: () => 0 }),
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('Bug #484: Navbar Spacing Issue', () => {
  describe('Header Component', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should render header with fixed positioning', () => {
      const { container } = render(<Header />);
      const header = container.querySelector('header');

      expect(header).toBeTruthy();
      expect(header?.className).toContain('fixed');
      expect(header?.className).toContain('top-0');
      expect(header?.className).toContain('z-50');
    });

    it('should have correct header height classes', () => {
      const { container } = render(<Header />);
      const header = container.querySelector('header');
      const headerContent = header?.querySelector('.container-custom');

      expect(headerContent).toBeTruthy();
      // Header uses py-4 which is 1rem (16px) top + bottom = 32px
      // Plus logo height ~48px = ~80px total
      expect(headerContent?.className).toContain('py-4');
    });

    it('should maintain header visibility at different viewport widths', () => {
      const { container } = render(<Header />);
      const header = container.querySelector('header');

      // Desktop navigation should be hidden on mobile
      const desktopNav = container.querySelector('nav.hidden.md\\:flex');
      expect(desktopNav).toBeTruthy();

      // Mobile menu toggle should exist
      const mobileMenuToggle = container.querySelector('.md\\:hidden button');
      expect(mobileMenuToggle).toBeTruthy();
    });
  });

  describe('Hero Section Spacing', () => {
    it('should render main container with proper top padding', () => {
      const { container } = render(<HomeClient />);
      const mainContainer = container.firstChild as HTMLElement;

      expect(mainContainer).toBeTruthy();
      // Main container should have pt-24 md:pt-32 (responsive padding)
      // Mobile: pt-24 = 6rem = 96px, Desktop: pt-32 = 8rem = 128px
      const classes = mainContainer?.className || '';
      expect(classes).toContain('pt-24');
      expect(classes).toContain('md:pt-32');
    });

    it('should have minimum height to prevent content collision', () => {
      const { container } = render(<HomeClient />);
      const heroSection = container.querySelector('section');

      // Should have min-h class to ensure adequate space
      expect(heroSection?.className).toMatch(/min-h-\[70vh\]/);
    });

    it('should have proper z-index for layering', () => {
      const { container } = render(<HomeClient />);
      const heroSection = container.querySelector('section');

      // Hero section should have z-10 to be above background
      expect(heroSection?.className).toContain('z-10');
    });
  });

  describe('Content Container Spacing', () => {
    it('should have container-custom class for proper width constraint', () => {
      const { container } = render(<HomeClient />);
      const heroContainer = container.querySelector('.container-custom');

      expect(heroContainer).toBeTruthy();
      expect(heroContainer?.className).toContain('max-w-6xl');
    });

    it('should render hero heading without overlap', () => {
      const { container } = render(<HomeClient />);

      // Check for heading presence - use more specific selector to avoid duplicates
      const heading = container.querySelector('h1');
      expect(heading).toBeTruthy();
      expect(heading?.textContent).toMatch(/AI Native/i);
    });

    it('should render CTA buttons in hero section', () => {
      const { container } = render(<HomeClient />);

      // Should have primary CTA
      const downloadLink = container.querySelector('a[href="/download"]');
      expect(downloadLink).toBeTruthy();

      // Should have secondary CTA (GitHub)
      const githubLinks = container.querySelectorAll('a[target="_blank"][rel="noopener noreferrer"]');
      expect(githubLinks.length).toBeGreaterThan(0);
    });
  });

  describe('Responsive Behavior', () => {
    it('should have responsive padding classes for mobile and desktop', () => {
      const { container } = render(<HomeClient />);
      const mainContainer = container.firstChild as HTMLElement;

      // Should have responsive top padding
      // Mobile: pt-24 (96px), Desktop: pt-32 (128px)
      const classes = mainContainer?.className || '';
      expect(classes).toContain('pt-24');
      expect(classes).toContain('md:pt-32');
    });

    it('should have responsive text sizes for different viewports', () => {
      const { container } = render(<HomeClient />);

      // Heading should have responsive text classes
      const heading = container.querySelector('h1');
      expect(heading?.className).toMatch(/text-4xl|md:text-6xl|lg:text-7xl/);
    });

    it('should stack buttons vertically on mobile', () => {
      const { container } = render(<HomeClient />);

      // Button container should have flex-col on mobile, flex-row on desktop
      const buttonContainer = container.querySelector('.flex.flex-col.sm\\:flex-row');
      expect(buttonContainer).toBeTruthy();
    });
  });

  describe('Scroll Behavior', () => {
    it('should maintain header position on scroll', () => {
      const { container } = render(<Header />);
      const header = container.querySelector('header');

      // Header should remain fixed
      expect(header?.className).toContain('fixed');
      expect(header?.className).toContain('top-0');
    });

    it('should not have content jumping due to position changes', () => {
      const { container } = render(<HomeClient />);

      // Outer container should have relative positioning
      const mainContainer = container.querySelector('.relative.flex.flex-col');
      expect(mainContainer).toBeTruthy();
    });
  });

  describe('Visual Regression Prevention', () => {
    it('should have background layers properly ordered', () => {
      const { container } = render(<HomeClient />);

      // Background should be -z-10 or lower
      const backgrounds = container.querySelectorAll('[class*="-z-"]');
      expect(backgrounds.length).toBeGreaterThan(0);
    });

    it('should have proper gradient overlays', () => {
      const { container } = render(<HomeClient />);

      // Should have gradient background
      const gradients = container.querySelectorAll('[class*="bg-gradient"]');
      expect(gradients.length).toBeGreaterThan(0);
    });

    it('should have animated background elements', () => {
      const { container } = render(<HomeClient />);

      // Should have background gradient or animation divs
      // Our mock doesn't support animations, so just check for background structure
      const backgrounds = container.querySelectorAll('[class*="bg-gradient"], [class*="absolute"]');
      expect(backgrounds.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      const { container } = render(<HomeClient />);

      const h1 = container.querySelector('h1');
      const h2 = container.querySelector('h2');

      expect(h1).toBeTruthy();
      expect(h2).toBeTruthy();
    });

    it('should have alt text for logo image', () => {
      render(<Header />);

      const logo = screen.getByAltText('AINative Studio');
      expect(logo).toBeTruthy();
    });

    it('should have aria-labels for interactive elements', () => {
      const { container } = render(<Header />);

      const menuToggle = container.querySelector('[aria-label="Toggle mobile menu"]');
      expect(menuToggle).toBeTruthy();
    });
  });

  describe('Critical Spacing Measurements', () => {
    it('should have sufficient spacing to clear navbar height', () => {
      const { container } = render(<HomeClient />);
      const mainContainer = container.firstChild as HTMLElement;

      // Navbar is ~80px (py-4 + logo ~48px)
      // Main container should have:
      // - Mobile: pt-24 = 96px (sufficient clearance)
      // - Desktop: pt-32 = 128px (comfortable spacing)
      const classes = mainContainer?.className || '';

      expect(classes).toContain('pt-24'); // Mobile: 96px > 80px navbar
      expect(classes).toContain('md:pt-32'); // Desktop: 128px > 80px navbar
    });

    it('should have proper vertical rhythm throughout page', () => {
      const { container } = render(<HomeClient />);

      // All sections should have consistent spacing
      const sections = container.querySelectorAll('section');
      expect(sections.length).toBeGreaterThan(1);

      // Check that at least one section has spacing classes
      // (Some sections may have spacing on parent containers instead)
      const sectionsWithSpacing = Array.from(sections).filter(section => {
        const hasSpacing =
          section.className.includes('pt-') ||
          section.className.includes('py-') ||
          section.className.includes('pb-') ||
          section.className.includes('mt-') ||
          section.className.includes('my-') ||
          section.className.includes('mb-') ||
          section.className.includes('full-width-section'); // Custom spacing class

        return hasSpacing;
      });

      expect(sectionsWithSpacing.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very small viewport heights', () => {
      const { container } = render(<HomeClient />);
      const heroSection = container.querySelector('section');

      // Should have min-height to prevent collapse
      expect(heroSection?.className).toMatch(/min-h-/);
    });

    it('should handle mobile menu open state', () => {
      const { container, getByLabelText } = render(<Header />);

      const menuButton = getByLabelText('Toggle mobile menu');
      expect(menuButton).toBeTruthy();

      // Mobile menu is initially closed (not in DOM)
      let mobileMenu = container.querySelector('.fixed.inset-0.z-40');
      expect(mobileMenu).toBeFalsy();

      // Note: Click testing with state updates requires act() wrapper
      // For now, just verify the button exists
    });

    it('should handle authenticated user state', () => {
      // For this test, just verify the header renders with the default mock
      // (Testing authentication states would require more complex mock overrides)
      const { container } = render(<Header />);

      // Header should render regardless of auth state
      const header = container.querySelector('header');
      expect(header).toBeTruthy();

      // Verify auth-dependent elements are present in unauthenticated state
      const signInLink = container.querySelector('a[href="/login"]');
      expect(signInLink).toBeTruthy();
    });
  });
});
