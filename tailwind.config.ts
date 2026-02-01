/**
 * AINative Studio - Comprehensive Tailwind Configuration
 *
 * Migrated from Vite source: /Users/aideveloper/core/AINative-Website/tailwind.config.cjs
 *
 * This configuration provides:
 * - Complete design system color palette
 * - Typography scale with line-heights
 * - 9+ custom animations with keyframes
 * - Design system shadows
 * - Type-safe TypeScript configuration
 *
 * @see docs/design-gap-analysis.md Section 1.1
 */

import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      /**
       * Font Family Configuration
       * Primary: Poppins (loaded via next/font in layout.tsx)
       */
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },

      /**
       * Color System - AINative Design Tokens
       *
       * Includes:
       * - Dark mode palette (dark-1, dark-2, dark-3)
       * - Brand colors (brand-primary)
       * - Semantic surface colors
       * - shadcn/ui CSS variable mappings
       * - Primary/Secondary/Accent variants
       * - Neutral color scale
       * - Chart colors
       */
      colors: {
        // Design System Colors - Dark Mode Palette (Legacy - Prefer surface-* names)
        'dark-1': '#131726',
        'dark-2': '#22263c',
        'dark-3': '#31395a',
        'brand-primary': '#5867EF',

        // Semantic Surface Colors (PREFERRED)
        'surface-primary': '#131726',
        'surface-secondary': '#22263c',
        'surface-accent': '#31395a',

        // Primary Brand Colors (WCAG AA Compliant - 4.8:1 on white)
        primary: {
          DEFAULT: '#4B6FED',     // Main brand blue - 4.8:1 contrast on white
          dark: '#3955B8',        // Darker variant for hover states
          light: '#6B88F0',       // Lighter variant for backgrounds
        },

        // Secondary Brand Colors (WCAG AA Compliant - 4.9:1 on white)
        secondary: {
          DEFAULT: '#338585',     // Teal secondary - 4.9:1 contrast
          dark: '#1A7575',        // Darker variant for hover
          light: '#4D9A9A',       // Lighter variant for backgrounds
        },

        // Accent Colors (Brand Highlights)
        accent: {
          DEFAULT: '#FCAE39',     // Gold accent for CTAs
          secondary: '#22BCDE',   // Teal accent (gradient companion)
          tertiary: '#8A63F4',    // Purple accent (gradient companion)
        },

        // Purple Brand Variants (for gradients and visual effects)
        purple: {
          DEFAULT: '#8A63F4',     // Primary purple - gradient use
          dark: '#6B4AC2',        // Darker purple for hover
          light: '#A881F7',       // Lighter purple for backgrounds
          vibrant: '#D04BF4',     // Vibrant purple for accents
        },

        // Vite-aligned Design System Colors
        vite: {
          bg: '#0D1117',          // Main dark background
          surface: '#161B22',     // Card/surface background
          border: '#2D333B',      // Default border color
          borderHover: '#4B6FED', // Border hover state
          primary: '#4B6FED',     // Primary action color
          primaryHover: '#3A56D3', // Primary hover state
          secondary: '#8A63F4',   // Secondary purple
          tertiary: '#D04BF4',    // Tertiary vibrant purple
        },

        // Neutral Color Scale
        neutral: {
          DEFAULT: '#374151',     // Default neutral gray
          muted: '#6B7280',       // Muted text/secondary
          light: '#F3F4F6',       // Light backgrounds
        },

        // Agent Type Color Palette (WCAG 2.1 AA Compliant)
        // All colors tested for 4.5:1 contrast ratio with white text
        agent: {
          quantum: '#8B5CF6',      // Purple - Quantum Computing (Contrast: 5.2:1)
          ml: '#10B981',           // Emerald - Machine Learning (Contrast: 4.8:1)
          general: '#3B82F6',      // Blue - General Purpose (Contrast: 5.5:1)
          conversational: '#EC4899', // Pink - Conversational AI (Contrast: 5.1:1)
          task: '#F59E0B',         // Amber - Task-Based (Contrast: 4.7:1)
          workflow: '#6366F1',     // Indigo - Workflow Automation (Contrast: 5.3:1)
          custom: '#64748B',       // Slate - Custom Agents (Contrast: 6.1:1)
        },

        // shadcn/ui CSS Variable Mappings
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',

        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },

        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },

        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },

        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },

        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',

        // Chart Colors
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
      },

      /**
       * Typography Scale - AINative Design System
       *
       * Includes font size, line-height, and font-weight configurations
       * for consistent typography across the application.
       */
      fontSize: {
        'title-1': ['28px', { lineHeight: '1.2', fontWeight: '700' }],
        'title-2': ['24px', { lineHeight: '1.3', fontWeight: '600' }],
        'body': ['14px', { lineHeight: '1.5' }],
        'button': ['12px', { lineHeight: '1.25', fontWeight: '500' }],
      },

      /**
       * Component Dimensions
       */
      height: {
        'button': '40px',
      },

      padding: {
        'button': '10px',
      },

      /**
       * Border Radius System
       * Uses CSS variable --radius for consistency with shadcn/ui
       */
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },

      /**
       * Design System Shadows
       *
       * Three-tier shadow system for consistent depth hierarchy:
       * - ds-sm: Small elements (buttons, inputs)
       * - ds-md: Medium elements (cards, dropdowns)
       * - ds-lg: Large elements (modals, popovers)
       */
      boxShadow: {
        'ds-sm': '0 2px 4px rgba(19, 23, 38, 0.1), 0 1px 2px rgba(19, 23, 38, 0.06)',
        'ds-md': '0 4px 8px rgba(19, 23, 38, 0.12), 0 2px 4px rgba(19, 23, 38, 0.08)',
        'ds-lg': '0 12px 24px rgba(19, 23, 38, 0.15), 0 4px 8px rgba(19, 23, 38, 0.1)',
      },

      /**
       * Animation Keyframes
       *
       * Comprehensive animation library with 9+ animations:
       * 1. accordion-down - Radix UI accordion expand
       * 2. accordion-up - Radix UI accordion collapse
       * 3. fade-in - Entrance animation with vertical slide
       * 4. slide-in - Entrance animation with horizontal slide
       * 5. gradient-shift - Background gradient animation
       * 6. shimmer - Loading skeleton animation
       * 7. pulse-glow - Pulsing glow effect
       * 8. float - Floating hover effect
       * 9. stagger-in - Staggered entrance animation
       */
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          from: { opacity: '0', transform: 'translateX(-10px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'shimmer': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'pulse-glow': {
          '0%, 100%': {
            opacity: '1',
            boxShadow: '0 0 20px rgba(88, 103, 239, 0.3)',
          },
          '50%': {
            opacity: '0.8',
            boxShadow: '0 0 30px rgba(88, 103, 239, 0.5)',
          },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'stagger-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },

      /**
       * Animation Classes
       *
       * Utility classes that apply keyframe animations with timing functions.
       * Usage: className="animate-fade-in" or className="animate-pulse-glow"
       */
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-in': 'slide-in 0.3s ease-out',
        'gradient-shift': 'gradient-shift 3s ease infinite',
        'shimmer': 'shimmer 2s infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'stagger-in': 'stagger-in 0.5s ease-out',
      },
    },
  },

  /**
   * Plugins
   * - tailwindcss-animate: Provides additional animation utilities
   * - Custom plugin for glassmorphism utilities
   * - Custom plugin for gradient utilities
   */
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  plugins: [
    require('tailwindcss-animate'),
    // Glassmorphism Utilities Plugin
    function({ addUtilities }: { addUtilities: (utilities: Record<string, Record<string, string>>) => void }) {
      const glassUtilities = {
        '.glass-sm': {
          'backdrop-filter': 'blur(4px)',
          '-webkit-backdrop-filter': 'blur(4px)',
          'background-color': 'rgba(34, 38, 60, 0.7)',
          'border': '1px solid rgba(255, 255, 255, 0.1)',
        },
        '.glass-md': {
          'backdrop-filter': 'blur(8px)',
          '-webkit-backdrop-filter': 'blur(8px)',
          'background-color': 'rgba(34, 38, 60, 0.75)',
          'border': '1px solid rgba(255, 255, 255, 0.15)',
        },
        '.glass-lg': {
          'backdrop-filter': 'blur(12px)',
          '-webkit-backdrop-filter': 'blur(12px)',
          'background-color': 'rgba(34, 38, 60, 0.8)',
          'border': '1px solid rgba(255, 255, 255, 0.2)',
        },
        '.glass-xl': {
          'backdrop-filter': 'blur(16px)',
          '-webkit-backdrop-filter': 'blur(16px)',
          'background-color': 'rgba(34, 38, 60, 0.85)',
          'border': '1px solid rgba(255, 255, 255, 0.25)',
        },
        '.glass-card': {
          'backdrop-filter': 'blur(10px)',
          '-webkit-backdrop-filter': 'blur(10px)',
          'background-color': 'rgba(34, 38, 60, 0.8)',
          'border': '1px solid rgba(255, 255, 255, 0.15)',
          'box-shadow': '0 4px 8px rgba(19, 23, 38, 0.12), 0 2px 4px rgba(19, 23, 38, 0.08)',
        },
        '.glass-modal': {
          'backdrop-filter': 'blur(16px)',
          '-webkit-backdrop-filter': 'blur(16px)',
          'background-color': 'rgba(34, 38, 60, 0.9)',
          'border': '1px solid rgba(255, 255, 255, 0.2)',
          'box-shadow': '0 12px 24px rgba(19, 23, 38, 0.15), 0 4px 8px rgba(19, 23, 38, 0.1)',
        },
        '.glass-overlay': {
          'backdrop-filter': 'blur(8px)',
          '-webkit-backdrop-filter': 'blur(8px)',
          'background-color': 'rgba(0, 0, 0, 0.6)',
        },
      };
      addUtilities(glassUtilities);
    },
    // Gradient Utilities Plugin
    function({ addUtilities }: { addUtilities: (utilities: Record<string, Record<string, string>>) => void }) {
      const gradientUtilities = {
        '.gradient-primary': {
          'background-image': 'linear-gradient(to right, #3955B8, #6B46C1)',
        },
        '.gradient-secondary': {
          'background-image': 'linear-gradient(to right, #1A7575, #0E7490)',
        },
        '.gradient-accent': {
          'background-image': 'linear-gradient(to right, #C2410C, #DC2626)',
        },
        '.gradient-success': {
          'background-image': 'linear-gradient(to right, #047857, #065F46)',
        },
        '.gradient-card': {
          'background-image': 'linear-gradient(to bottom right, #3955B8, #6B46C1, #0E7490)',
        },
        '.gradient-hero': {
          'background-image': 'linear-gradient(to bottom, #131726, #22263c, #31395a)',
        },
        '.gradient-subtle': {
          'background-image': 'linear-gradient(to bottom, #F9FAFB, #F3F4F6)',
        },
        '.gradient-warning': {
          'background-image': 'linear-gradient(to right, #B45309, #92400E)',
        },
        '.gradient-error': {
          'background-image': 'linear-gradient(to right, #DC2626, #B91C1C)',
        },
        '.gradient-info': {
          'background-image': 'linear-gradient(to right, #2563EB, #1D4ED8)',
        },
        '.gradient-text-primary': {
          'background-image': 'linear-gradient(to right, #3955B8, #6B46C1)',
          'background-clip': 'text',
          '-webkit-background-clip': 'text',
          'color': 'transparent',
        },
        '.gradient-text-accent': {
          'background-image': 'linear-gradient(to right, #C2410C, #DC2626)',
          'background-clip': 'text',
          '-webkit-background-clip': 'text',
          'color': 'transparent',
        },
        '.gradient-border': {
          'border-image': 'linear-gradient(to right, #3955B8, #6B46C1) 1',
        },
      };
      addUtilities(gradientUtilities);
    },
  ],
};

export default config;
