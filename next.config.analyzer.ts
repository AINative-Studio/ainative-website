import type { NextConfig } from "next";
import { withSentryConfig } from '@sentry/nextjs';
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  // Fix workspace root detection - use this project's directory
  turbopack: {
    root: process.cwd(),
  },
  // Silence RSC client-side errors in dev (shows full errors in terminal)
  reactStrictMode: true,

  // Production optimizations
  poweredByHeader: false,

  // Image optimization for external domains
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.ainative.studio',
      },
      {
        protocol: 'https',
        hostname: 'ainative-community-production.up.railway.app',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.lu.ma',
      },
    ],
  },

  // Output standalone for Railway deployment
  output: 'standalone',

  // Experimental features for better optimization
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      'framer-motion',
      'recharts',
    ],
  },
};

// Sentry configuration options
const sentryWebpackPluginOptions = {
  // Only upload source maps in production
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Suppress error messages in development
  hideSourceMaps: true,
  disableLogger: true,

  // Only enable in production builds
  widenClientFileUpload: true,
  transpileClientSDK: true,
};

// Wrap config with bundle analyzer, then Sentry
const configWithAnalyzer = withBundleAnalyzer(nextConfig);

export default process.env.NEXT_PUBLIC_SENTRY_DSN
  ? withSentryConfig(configWithAnalyzer, sentryWebpackPluginOptions)
  : configWithAnalyzer;
