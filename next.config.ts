import type { NextConfig } from "next";
import { withSentryConfig } from '@sentry/nextjs';

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
      'react-icons',
      '@tanstack/react-query',
    ],
  },

  // Cache headers configuration for optimal performance
  async headers() {
    return [
      // Cache static assets (images, fonts, etc.)
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/fonts/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Cache public assets with 1-day expiry
      {
        source: '/(favicon.ico|robots.txt|sitemap.xml)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },
      // Cache OG images
      {
        source: '/og-:slug*.png',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },
      // Security headers for all routes
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },

  // Webpack configuration for bundle optimization
  webpack: (config, { isServer }) => {
    // Bundle analyzer (enabled with ANALYZE=true)
    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          reportFilename: isServer
            ? '../analyze/server.html'
            : './analyze/client.html',
          openAnalyzer: true,
          generateStatsFile: true,
          statsFilename: isServer ? '../analyze/server-stats.json' : './analyze/client-stats.json',
        })
      );
    }

    // Optimize chunk splitting for client bundles
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            // Separate React and React DOM
            react: {
              test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
              name: 'react-vendor',
              priority: 40,
              reuseExistingChunk: true,
            },
            // Separate UI library (Radix UI)
            radixui: {
              test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
              name: 'radix-ui',
              priority: 35,
              reuseExistingChunk: true,
            },
            // Separate chart library
            charts: {
              test: /[\\/]node_modules[\\/]recharts[\\/]/,
              name: 'charts',
              priority: 30,
              reuseExistingChunk: true,
            },
            // Separate animation library
            animations: {
              test: /[\\/]node_modules[\\/]framer-motion[\\/]/,
              name: 'animations',
              priority: 30,
              reuseExistingChunk: true,
            },
            // Separate icons
            icons: {
              test: /[\\/]node_modules[\\/](lucide-react|react-icons|@radix-ui\/react-icons)[\\/]/,
              name: 'icons',
              priority: 25,
              reuseExistingChunk: true,
            },
            // Separate large utilities
            utilities: {
              test: /[\\/]node_modules[\\/](axios|date-fns|zod)[\\/]/,
              name: 'utilities',
              priority: 20,
              reuseExistingChunk: true,
            },
            // Default vendor chunk for remaining node_modules
            defaultVendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendor',
              priority: 10,
              reuseExistingChunk: true,
            },
            // Common chunks shared across pages
            common: {
              minChunks: 2,
              priority: 5,
              reuseExistingChunk: true,
              enforce: true,
            },
          },
        },
      };
    }

    return config;
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

// Wrap config with Sentry only if DSN is configured
export default process.env.NEXT_PUBLIC_SENTRY_DSN
  ? withSentryConfig(nextConfig, sentryWebpackPluginOptions)
  : nextConfig;
